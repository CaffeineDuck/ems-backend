import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { UrgentService } from './urgent.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Server, Socket } from 'socket.io';

// TODO: Make sure that only right user and workshop can connect
@WebSocketGateway({ transports: ['websocket'] })
export class UrgentGateway implements OnGatewayConnection {
  @WebSocketServer()
  socket: Server;

  constructor(private readonly urgentService: UrgentService) {}

  handleConnection(client: Socket) {
    const { urgentId } = client.handshake.query;
    client.join(`urgent-${urgentId}`);
  }

  @SubscribeMessage('updateLocation')
  async updateLocation(@MessageBody() updateLocationDto: UpdateLocationDto) {
    const { id, lat, lng } = updateLocationDto;
    await this.urgentService.updateLocation(id, lat, lng);
    this.socket.in(`urgent-${id}`).emit('updateLocation', { lat, lng });
  }
}
