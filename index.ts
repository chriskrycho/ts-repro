// -- Make a minimal`Maybe` type just so we have an example of something generic
// that we can use below
class Just<T> {
  constructor(private value: T) {}

  map<U>(fn: (t: T) => U): Maybe<U> {
    return new Just(fn(this.value));
  }
}

class Nothing<T> {
  map<U>(fn: (t: T) => U): Maybe<U> {
    return (this as unknown) as Nothing<U>;
  }
}

type Maybe<T> = Just<T> | Nothing<T>;

// -- These types are just here because they give me a foundation to use with
// building up the complex type below which causes the explosion in build time.
type NonNullableFieldNames<T> = {
  [K in keyof T]: T[K] extends NonNullable<T[K]> ? K : never
}[keyof T];

type NullableFieldNames<T> = Exclude<keyof T, NonNullableFieldNames<T>>;

type NonNullableFields<T> = Pick<T, NonNullableFieldNames<T>>;

type NullableFields<T> = Pick<T, Exclude<keyof T, NonNullableFieldNames<T>>>;

// -- These are from a form validation library where I saw this blow up. I have
// removed the vast majority of the complexity there.
class OptionalField<T> {
  readonly value?: T;
  readonly isRequired: false = false;
}

class RequiredField<T> {
  readonly value?: T;
  readonly isRequired: true = true;
}

// -- Now, some conditional types interacting with this generic type, which will
// will cause *serious* compile time degradation ever since conditional types
// were introduced in 2.8, but especially after 3.1.
type Form<T> = Required<
  {
    [K in keyof T]: K extends NonNullableFieldNames<T>
      ? T[K] extends Maybe<infer U>
        ? OptionalField<U>
        : RequiredField<T[K]>
      : OptionalField<NonNullable<T[K]>>
  }
>;

type FromModel<T> = (
  model: T extends Maybe<infer U> ? Maybe<Partial<U>> : Partial<T>
) => Form<T extends Maybe<infer U> ? U : T>;

// -- That sufficiently sets up the example to demonstrate how performance
// degrades. To demonstrate the performance regression, simply
interface User {
  age: number;
  name?: string;
  email: Maybe<string>;
}

const formFromUser: FromModel<User> = user => ({
  age: new RequiredField(),
  name: new OptionalField(),
  email: new OptionalField()
});
