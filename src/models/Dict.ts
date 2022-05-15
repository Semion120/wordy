import { Ref, getModelForClass, prop } from '@typegoose/typegoose'
import { Word } from '@/models/Word'

export class Dict {
  @prop({ required: true, index: true, unique: true })
  name!: string
  @prop({ ref: Word, required: true, index: true })
  words!: Ref<Word>[]
}

export const DictModel = getModelForClass(Dict)
