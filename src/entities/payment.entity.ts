import { BaseEntity } from 'src/common/entities/base.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CardBrand {
  'VISA',
  'MASTERCARD',
  'AMEX',
}

export enum PaymentStatus {
  'PENDING',
  'APPROVED',
  'DECLINED',
}

@Entity()
export class Payment extends BaseEntity {
  private _status: PaymentStatus;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  foreign_transaction_id: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  get status(): PaymentStatus {
    return this._status;
  }
  set status(value: PaymentStatus) {
    if (value && value !== this._status) {
      this.addEvent({
        eventName: 'payment.status-updated',
        payload: {
          payment_id: this.id,
          status: value,
        },
      });
    }
    this._status = value;
  }

  @Column()
  total: number;

  @Column({
    type: 'enum',
    enum: CardBrand,
  })
  card_brand: CardBrand;

  @Column()
  card_number: string;

  @Column()
  card_holder: string;

  @Column()
  card_expiration: string;

  @Column()
  card_cvv: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
