import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'

export default (data) =>
  validator.validate({
    schema: schema.create({
      token: schema.string([rules.trim(), rules.uuid()])
    }),
    data
  })
