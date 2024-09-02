import { Module } from '@nestjs/common';
import { EntityEventsDispatcher } from './events/entity-events-dispatcher';

@Module({
  imports: [],
  providers: [EntityEventsDispatcher],
  exports: [EntityEventsDispatcher],
})
export class CommonModule {}
