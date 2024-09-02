import { AfterLoad } from 'typeorm';

type BaseEntityEvent = {
  eventName: string;
  payload: unknown;
};

export class BaseEntity {
  private events = new Array<BaseEntityEvent>();

  addEvent(event: BaseEntityEvent): void {
    this.events.push(event);
  }

  clearEvents(): void {
    this.events = [];
  }

  getEvents(): Array<BaseEntityEvent> {
    return this.events;
  }

  @AfterLoad()
  clearEventsAfterLoad(): void {
    this.clearEvents();
  }
}
