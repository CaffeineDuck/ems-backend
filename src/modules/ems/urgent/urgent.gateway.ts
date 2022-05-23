import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  WsException,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { UrgentService } from './urgent.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Server, Socket } from 'socket.io';
import { UserId } from 'src/modules/user/decorators/user-id.decorator';
import { RequestUrgentDto } from './dto/request-urgent.dto';
import { StopUrgentDto } from './dto/stop-urgent.dto';
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt.guard';
import { CACHE_MANAGER, Inject, UseGuards } from '@nestjs/common';
import { AccessTokenPayload } from 'src/modules/auth/entities/accessToken.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { EmistriLogger } from 'src/modules/commons/logger/logger.service';
import { Cache } from 'cache-manager';
import { AcceptRequestDto } from './dto/accept-request.dto';

// TODO: Make sure that only right user and workshop can connect
@WebSocketGateway({ transports: ['websocket'] })
@UseGuards(WsJwtGuard)
export class UrgentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  socket: Server;

  constructor(
    private readonly urgentService: UrgentService,
    private readonly configService: ConfigService<IConfig>,
    private readonly loggerService: EmistriLogger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async afterInit(_: Server) {
    const getUrentKey = this.urgentService.getUrgentName('*');
    const keys: string[] = await this.cacheManager.store.keys!(getUrentKey);

    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }

  async handleDisconnect(client: Socket) {
    const authToken = client.handshake.headers.authorization?.split(
      ' ',
    )[1] as string;
    if (!authToken) return;

    let jwtPayload = jwt.verify(
      authToken,
      this.configService.get('jwt.secret', { infer: true })!,
    ) as AccessTokenPayload;

    const urgentUserId = this.urgentService.getUrgentName(jwtPayload.userId);
    await this.cacheManager.del(urgentUserId);

    this.loggerService.debug(
      `[handleDisconnect] User: ${jwtPayload.userId}-${jwtPayload.role}`,
    );
  }

  async handleConnection(client: Socket, ..._: any[]) {
    const authToken = client.handshake.headers.authorization?.split(
      ' ',
    )[1] as string;
    if (!authToken) client.disconnect();

    let jwtPayload = jwt.verify(
      authToken,
      this.configService.get('jwt.secret', { infer: true })!,
    ) as AccessTokenPayload;

    const urgentUserId = this.urgentService.getUrgentName(jwtPayload.userId);
    await this.cacheManager.set(urgentUserId, client.id, {
      ttl: 1000 * 1000 * 24,
    });

    this.loggerService.debug(
      `[handleConnection] User: ${jwtPayload.userId}-${jwtPayload.role}`,
    );
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @UserId() userId: string,
    @MessageBody('room') roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!roomId) throw new WsException('No room id provided');
    this.loggerService.debug(`[joinRoom] ${userId} joined ${roomId}`);

    // TODO: Perfom validation for user
    const urgentRoomId = this.urgentService.getUrgentName(roomId);
    client.join(urgentRoomId);
  }

  @SubscribeMessage('request')
  async requestUrgent(
    @UserId() userId: string,
    @MessageBody() requestUrgent: RequestUrgentDto,
    @ConnectedSocket() client: Socket,
  ) {
    // TODO: Don't let user create another request if request already in queue
    const [roomId, workshopOwnerId] = await this.urgentService.requestService(
      userId,
      requestUrgent,
    );

    const urgentWorkshopOwnerId = this.urgentService.getUrgentName(
      workshopOwnerId.toString(),
    );
    const workshopSocketId = await this.cacheManager.get(urgentWorkshopOwnerId);
    if (!workshopSocketId) {
      await this.urgentService.cancelRequest(
        roomId.toString().split(':')[0],
        roomId.toString(),
      );
      throw new WsException('Workshop not connected');
    }

    const urgentRoomId = this.urgentService.getUrgentName(roomId.toString());

    client.join(urgentRoomId);
    this.socket.to(urgentRoomId).emit('requestCreated', { roomId });
    this.socket
      .to(workshopSocketId as string)
      .emit('urgentRequest', { roomId });

    this.loggerService.log(`[requestUrgent] Emitted to roomId: ${roomId}`);
  }

  @SubscribeMessage('reject')
  async rejectUrgent(
    @UserId() userId: string,
    @MessageBody('requestId') requestId: string,
  ) {
    this.loggerService.debug(
      `[rejectUrgent] userId: ${userId}, requestId: ${requestId}`,
    );

    await this.urgentService.rejectRequest(userId, requestId);

    const urgentRequestId = this.urgentService.getUrgentName(requestId);
    this.socket
      .to(urgentRequestId)
      .emit('requestRejected', { urgentRequestId });

    this.loggerService.log('[rejectUrgent] Rejection complete');
  }

  @SubscribeMessage('accept')
  async acceptUrgent(
    @UserId() userId: string,
    @MessageBody() { requestId }: AcceptRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.loggerService.debug(`[acceptUrgent] requestId: ${requestId}`);

    const serviceId = await this.urgentService.acceptRequest(userId, requestId);
    this.loggerService.debug(`[acceptUrgent] serviceId: ${serviceId}`);

    const urgentRequestId = this.urgentService.getUrgentName(requestId);
    const urgentServiceId = this.urgentService.getUrgentName(serviceId);

    this.socket.to(urgentRequestId).emit('requestAccepted', { serviceId });
    client.join(urgentServiceId);

    this.loggerService.log('[acceptUrgent] Urgent request accepted');
  }

  @SubscribeMessage('end')
  async endRide(
    @UserId() userId: string,
    @MessageBody() stopUrgentDto: StopUrgentDto,
  ) {
    const { id } = stopUrgentDto;
    this.loggerService.debug(`[endRide] serviceId: ${id}`);

    const urgentId = this.urgentService.getUrgentName(id);

    const endData = await this.urgentService.stopService(userId, stopUrgentDto);
    this.socket.to(urgentId).emit('urgentEnd', endData);
    this.socket.socketsLeave(urgentId);

    this.loggerService.log('[endRide] Service Ended');
  }

  @SubscribeMessage('cancel')
  async cancelRequest(
    @MessageBody('requestId') requestId: string,
    @UserId() userId: string,
  ) {
    await this.urgentService.cancelRequest(userId, requestId);

    const urgentRequestId = this.urgentService.getUrgentName(requestId);
    this.socket.to(urgentRequestId).emit('requestCancel');
  }

  // TODO: Add validation for updating location
  @SubscribeMessage('updateLocation')
  async updateLocation(@MessageBody() updateLocationDto: UpdateLocationDto) {
    const { id, lat, lng } = updateLocationDto;
    await this.urgentService.updateLocation(id, lat, lng);

    const urgentId = this.urgentService.getUrgentName(id);
    this.socket.in(urgentId).emit('locationUpdated', { lat, lng });
  }
}
