import { Expose } from 'class-transformer';
import { Max, Min } from 'class-validator';
import { Complimentary } from 'src/complimentary/entities/complimentary.entity';
import { BaseEntity } from 'src/shared/baseEntity.entity';
import {
  SERVICE_FIELD_TYPE,
  SERVICE_STATUS,
  SERVICE_TYPE,
  TYPE_PACK,
} from 'src/shared/constants/service.constant';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
@Entity('services')
export class Service extends BaseEntity {
  @Expose()
  @Column()
  name: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: SERVICE_TYPE,
    nullable: true,
    default: null,
  })
  type: SERVICE_TYPE;

  @Expose()
  @Column({ name: 'type_pack', type: 'enum', enum: TYPE_PACK })
  typePack: TYPE_PACK;

  @Expose()
  @Column({
    default: 0,
  })
  price: number;

  @Expose()
  @Column({
    nullable: true,
  })
  description: string;

  @Expose()
  @Column({
    type: 'enum',
    enum: SERVICE_STATUS,
    default: SERVICE_STATUS.PENDING,
  })
  status: SERVICE_STATUS;

  @Expose()
  @Column({ name: 'field_type', type: 'enum', enum: SERVICE_FIELD_TYPE })
  fieldType: SERVICE_FIELD_TYPE;

  @Expose()
  @Column({ name: 'url_demo', nullable: true })
  urlDemo: string;

  @Expose()
  @Column({ name: 'is_index', default: false })
  isIndex: boolean;

  @Expose()
  @Column({ name: 'is_show', default: false })
  isShow: boolean;

  @Expose()
  @Column({ name: 'is_sale_text_link', default: false })
  isSaleTextLink: boolean;

  @Expose()
  @Column({ name: 'text_link_price', nullable: true })
  textLinkPrice: number;

  @Expose()
  @Column({ name: 'text_link_duration', nullable: true })
  textLinkDuration: number;

  @Expose()
  @Column({ name: 'text_link_note', nullable: true })
  textLinkNote: string;

  @Expose()
  @Column({ name: 'is_follow_text_link', default: false })
  isFollowTextLink: boolean;

  @Expose()
  @Column({ name: 'is_home_text_link', default: false })
  isHomeTextLink: boolean;

  @Expose()
  @Column({ name: 'is_footer_text_link', default: false })
  isFooterTextLink: boolean;

  @Expose()
  @Column({ name: 'is_sale_guest_post', default: false })
  isSaleGuestPost: boolean;

  @Expose()
  @Column({
    name: 'guest_post_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  guestPostPrice: number;

  @Expose()
  @Column({ name: 'guest_post_note', nullable: true })
  guestPostNote: string;

  @Expose()
  @Column({ name: 'note', nullable: true, length: 500 })
  note: string;

  @Expose()
  @Column({ name: 'is_follow_guest_post', default: false })
  isFollowGuestPost: boolean;

  @Expose()
  @Column({ name: 'is_index_guest_post', default: false })
  isIndexGuestPost: boolean;

  @Expose()
  @Column({ name: 'is_sale_banner', default: false })
  isSaleBanner: boolean;

  @Expose()
  @Column({
    name: 'banner_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  bannerPrice: number;

  @Expose()
  @Column({ name: 'banner_duration', nullable: true })
  bannerDuration: number;

  @Expose()
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.services)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Complimentary, (complimentary) => complimentary.service)
  complimentaries: Complimentary[];

  @Expose()
  @Column({
    default: 0,
    name: 'ref_domain',
    nullable: true,
  })
  refDomain: number;

  @Expose()
  @Column({
    default: 0,
    name: 'dr',
    nullable: true,
  })
  @Min(0)
  @Max(100)
  dr: number;

  @Expose()
  @Column({
    default: 0,
    name: 'organic_traffic',
    nullable: true,
  })
  organicTraffic: number;

  @Expose()
  @Column({
    default: 0,
    name: 'discount_pack_service',
    nullable: true,
  })
  discountPackService: number;

  @Expose()
  @Column({
    default: 0,
    name: 'discount_text_link_service',
    nullable: true,
  })
  discountTextLinkService: number;

  @Expose()
  @Column({
    default: 0,
    name: 'discount_guest_post_service',
    nullable: true,
  })
  discountGuestPostService: number;

  @Expose()
  @Column({
    default: 0,
    name: 'discount_banner_service',
    nullable: true,
  })
  discountBannerService: number;
  //
}
