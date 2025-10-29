import { Directive, Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
@Directive('@extends')
export class ServiceRecord {
  @Field(() => ID)
  @Directive('@external')
  id: string;

}