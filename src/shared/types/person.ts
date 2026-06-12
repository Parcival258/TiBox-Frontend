export type Person = {
  id: string
  name: string
  email?: string
  jobTitle?: string | null
  department?: string | null
} | null

export type Responsible = NonNullable<Person>
