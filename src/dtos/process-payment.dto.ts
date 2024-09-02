import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export class ProcessPaymentDto {
  @IsNumber()
  @Min(1)
  total: number;
  @IsEnum(['VISA', 'MASTERCARD', 'AMEX'])
  card_brand: string;
  @IsString()
  card_number: string;
  @IsString()
  card_holder: string;
  @IsString()
  card_expiration: string;
  @IsString()
  foreign_transaction_id: string;
  @IsString()
  card_cvv: string;
}
