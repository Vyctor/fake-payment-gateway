import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProcessPaymentDto } from './dtos/process-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, CardBrand, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { EntityEventsDispatcher } from './common/events/entity-events-dispatcher';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly eventDispatcher: EntityEventsDispatcher,
    private readonly httpService: HttpService,
    private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  async savePayment(payment: ProcessPaymentDto): Promise<void> {
    this.logger.log('Saving payment');
    const paymentToSave = this.paymentRepository.create({
      total: payment.total,
      card_brand: CardBrand[payment.card_brand],
      card_number: payment.card_number,
      card_holder: payment.card_holder,
      card_expiration: payment.card_expiration,
      foreign_transaction_id: payment.foreign_transaction_id,
      card_cvv: payment.card_cvv,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepository.save(paymentToSave);
    await this.fakeDelay();
    await this.eventEmitter.emitAsync('payment.created', {
      payment_id: paymentToSave.id,
    });
  }

  @OnEvent('payment.created')
  async processPayment(event: { payment_id: number }): Promise<void> {
    this.logger.log(`Processing payment with id ${event.payment_id}`);
    const payment = await this.paymentRepository.findOne({
      where: {
        id: event.payment_id,
      },
    });
    if (!payment) {
      this.logger.error(`Payment with id ${event.payment_id} not found`);
      throw new NotFoundException('Payment not found');
    }
    const randonPercentage = Math.floor(Math.random() * 100);
    if (randonPercentage <= 10) {
      payment.status = PaymentStatus.DECLINED;
    } else {
      payment.status = PaymentStatus.APPROVED;
    }
    await this.fakeDelay();
    await this.paymentRepository.save(payment);
    await this.eventDispatcher.dispatch(payment);
  }

  @OnEvent('payment.status-updated')
  async notifyClient(event: { payment_id: number; status: PaymentStatus }) {
    this.logger.log(
      `Notifying client about payment with id ${event.payment_id}`,
    );
    const payment = await this.paymentRepository.findOne({
      where: {
        id: event.payment_id,
      },
    });
    if (!payment) {
      this.logger.error(`Payment with id ${event.payment_id} not found`);
      throw new NotFoundException('Payment not found');
    }
    await this.fakeDelay();
    await firstValueFrom(
      this.httpService
        .post(this.config.get('NOTIFY_CLIENT_URL'), {
          payment_id: payment.id,
          payment_foreign_transaction_id: payment.foreign_transaction_id,
          status: PaymentStatus[event.status],
        })
        .pipe(
          map((response) => response.data),
          catchError((error) => {
            this.logger.error(error);
            return error;
          }),
        ),
    );
  }

  private async fakeDelay(maxMS: number = 1000): Promise<void> {
    const fakeDelay = Math.floor(Math.random() * maxMS);
    this.logger.log(`Fake delay: ${fakeDelay / 1000}s`);
    await new Promise((resolve) => setTimeout(resolve, fakeDelay));
  }
}
