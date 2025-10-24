import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType()
@Entity('vehicles')

export class Vehicle {
    @Field(()=>ID)
    @PrimaryGeneratedColumn()
    id: number;

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

    @Field()
    @Column({type: 'int'})
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
}