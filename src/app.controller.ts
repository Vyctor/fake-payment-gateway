import { Body, Controller, Post } from '@nestjs/common';
import { ProcessPaymentDto } from './dtos/process-payment.dto';
import { AppService } from './app.service';

@Controller('payments')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('create')
  async processPayment(@Body() payment: ProcessPaymentDto) {
    await this.appService.savePayment(payment);
    return {
      message: 'Your payment will be processed soon and returned by webhook',
    };
  }
}
