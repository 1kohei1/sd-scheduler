import { Server } from 'http';
import * as socketio from 'socket.io';

export default class SocketIOUtil {
  private static io: any;

  static setIO(server: Server) {
    this.io = socketio(server);
  }

  static emit(key: string, data: any) {
    this.io.emit(key, data);
  }
}