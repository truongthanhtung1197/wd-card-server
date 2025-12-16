export class CreateCartDto {}

// export class CreateCartListDto {
//   @ApiProperty({
//     type: [CreateCartDto],
//     example: [
//       {
//         serviceId: 1,
//         domainId: 1,
//         quantity: 10,
//       },
//     ],
//   })
//   @ValidateNested({ each: true })
//   @Type(() => CreateCartDto)
//   @ArrayMinSize(1)
//   carts: CreateCartDto[];
// }
