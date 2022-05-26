import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  WsException,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UrgentService } from './urgent.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Server, Socket } from 'socket.io';
import { UserId } from 'src/modules/user/decorators/user-id.decorator';
import { RequestUrgentDto } from './dto/request-urgent.dto';
import { StopUrgentDto } from './dto/stop-urgent.dto';
import { WsJwtGuard } from 'src/modules/auth/guards/ws-jwt.guard';
import { CACHE_MANAGER, Inject, OnModuleInit, UseGuards } from '@nestjs/common';
import { AccessTokenPayload } from 'src/modules/auth/entities/accessToken.entity';
import { EmistriLogger } from 'src/modules/commons/logger/logger.service';
import { Cache } from 'cache-manager';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { WsRolesGuard } from 'src/modules/auth/guards/ws-roles.guard';
import { HasRoles } from 'src/modules/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { TokenService } from 'src/modules/auth/services/token.service';

// TODO: Make sure that only right user and workshop can connect
// TODO: Add cancellation after start of service
// TODO: Add busy/non-busy system for workshops
@WebSocketGateway({
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  cors: {
    credentials: true,
  },
})
@UseGuards(WsJwtGuard, WsRolesGuard)
export class UrgentGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  socket: Server;

  constructor(
    private readonly urgentService: UrgentService,
    private readonly loggerService: EmistriLogger,
    private readonly tokenService: TokenService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private getAuthToken(authorization?: string) {
    return authorization?.split(' ')[1] as string;
  }

  // TODO: Use shutdown hook instead of moduleInit hook
  async onModuleInit() {
    const urgentKey = this.urgentService.getUrgentName('*');
    const keys = await this.cacheManager.store.keys!(urgentKey);

    await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
  }

  async handleDisconnect(client: Socket) {
    const authToken = this.getAuthToken(
      client?.handshake?.headers?.authorization,
    );
    if (!authToken) return;

    let jwtPayload = await this.tokenService.decodeToken<AccessTokenPayload>(
      authToken,
    );
    const urgentUserId = this.urgentService.getUrgentName(jwtPayload.userId);
    await this.cacheManager.del(urgentUserId);

    this.loggerService.debug(
      `[handleDisconnect] User: ${jwtPayload.userId}-${jwtPayload.role}`,
    );
  }

  async handleConnection(client: Socket, ..._: any[]) {
    const authToken = this.getAuthToken(
      client?.handshake?.headers?.authorization,
    );
    if (!authToken) client.disconnect();

    let jwtPayload = await this.tokenService.decodeToken<AccessTokenPayload>(
      authToken,
    );

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

  @SubscribeMessage('requestUrgent')
  @HasRoles(Role.USER)
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
    this.socket.to(urgentRoomId).emit('urgentCreated', { roomId });
    this.socket
      .to(workshopSocketId as string)
      .emit('requestUrgent', { roomId });

    this.loggerService.log(`[requestUrgent] Emitted to roomId: ${roomId}`);
  }

  @SubscribeMessage('rejectUrgent')
  @HasRoles(Role.WORKSHOP)
  async rejectUrgent(
    @UserId() userId: string,
    @MessageBody('requestId') requestId: string,
  ) {
    this.loggerService.debug(
      `[rejectUrgent] userId: ${userId}, requestId: ${requestId}`,
    );

    await this.urgentService.rejectRequest(userId, requestId);

    const urgentRequestId = this.urgentService.getUrgentName(requestId);
    this.socket.to(urgentRequestId).emit('urgentRejected', { urgentRequestId });
    this.socket.socketsLeave(urgentRequestId);

    this.loggerService.log('[rejectUrgent] Rejection complete');
  }

  @SubscribeMessage('acceptUrgent')
  @HasRoles(Role.WORKSHOP)
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

    this.socket.to(urgentRequestId).emit('urgentAccepted', { serviceId });
    client.join(urgentServiceId);
    this.socket.socketsLeave(urgentRequestId);

    this.loggerService.log('[acceptUrgent] Urgent request accepted');
  }

  @SubscribeMessage('endUrgent')
  @HasRoles(Role.WORKSHOP)
  async endRide(
    @UserId() userId: string,
    @MessageBody() stopUrgentDto: StopUrgentDto,
  ) {
    const { id } = stopUrgentDto;
    this.loggerService.debug(`[endRide] serviceId: ${id}`);

    const urgentId = this.urgentService.getUrgentName(id);

    const endData = await this.urgentService.stopService(userId, stopUrgentDto);
    this.socket.to(urgentId).emit('endUrgent', endData);
    this.socket.socketsLeave(urgentId);

    this.loggerService.log('[endRide] Service Ended');
  }

  @SubscribeMessage('cancelUrgent')
  @HasRoles(Role.USER)
  async cancelRequest(
    @MessageBody('requestId') requestId: string,
    @UserId() userId: string,
  ) {
    await this.urgentService.cancelRequest(userId, requestId);

    const urgentRequestId = this.urgentService.getUrgentName(requestId);
    this.socket.to(urgentRequestId).emit('urgentCancelled');
  }

  // TODO: Add validation for updating location
  @SubscribeMessage('updateLocation')
  @HasRoles(Role.WORKSHOP)
  async updateLocation(@MessageBody() updateLocationDto: UpdateLocationDto) {
    const { id, lat, lng } = updateLocationDto;
    await this.urgentService.updateLocation(id, lat, lng);

    const urgentId = this.urgentService.getUrgentName(id);
    this.socket.in(urgentId).emit('locationUpdated', { lat, lng });
  }

  @SubscribeMessage('getCurrent')
  async getCurrentUrgent(
    @UserId() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const service = await this.urgentService.getCurrentRequest(userId);
    client.emit('getCurrent', service);
  }

  @SubscribeMessage('reachedDestination')
  @HasRoles(Role.WORKSHOP)
  async reachedDestination(
    @UserId() userId: string,
    @MessageBody('serviceId') serviceId: string,
  ) {
    const { userId: clientUserId } =
      await this.urgentService.reachedDestination(userId, serviceId);

    const urgentUserId = this.urgentService.getUrgentName(clientUserId);
    const socketId = (await this.cacheManager.get(urgentUserId)) as string;

    this.socket.to(socketId).emit('reachedDestination', { serviceId });
  }
}
