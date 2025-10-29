import { Directive, Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ServiceRecord } from "src/stubs/service-record.stub";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity('vehicles')
@Directive('@key(fields: "id")')
@Directive('@key(fields: "vin")') // vin based

export class Vehicle {
    @Field(()=>ID)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field()
    @Column()
    first_name: string;

    @Field()
    @Column()
    last_name: string;

    @Field()
    @Column()
    email: string;

    @Field()
    @Column()
    car_make:string

    @Field()
    @Column()
    car_model: string;

    @Field()
    @Column({unique: true})
    vin: string;

    @Field(() => String)
    @Column({ type: 'date', nullable: false })
    manufactured_date: Date;

    @Field(()=>Int)
    @Column({ type: 'int'})
    age_of_vehicle: number;

    @Field()
    @CreateDateColumn()
    created_at: Date;

    @Field()
    @UpdateDateColumn()
    updateed_at: Date;

     @Field(() => [ServiceRecord], { nullable: true })
  serviceRecords?: ServiceRecord[];
}