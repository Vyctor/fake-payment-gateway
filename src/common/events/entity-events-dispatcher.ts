import { Injectable } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EntityEventsDispatcher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async dispatch(entity: BaseEntity): Promise<void> {
    entity
      .getEvents()
      .map((event) => this.eventEmitter.emit(event.eventName, event.payload));
    entity.clearEvents();
  }
}
