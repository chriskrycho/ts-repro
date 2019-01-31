# A serious performance edge case in TS

Including these specific dependencies and importing them causes *extremely* degraded response times from TSC, including for compiles (as below) but also for resolution within the application.

In `index.ts`, switch out the optional declaration `email?: string` for the `Maybe` declaration `email: Maybe<string>`. You will immediately notice the performance degradation within e.g. VS Code, and also you'll see very different performance characteristics.

### TS 3.0.3

<details><summary><code>tsc --extendedDiagnostics</code> with optional (1.35s)</summary>

```sh
~> time yarn tsc --extendedDiagnostics
yarn run v1.13.0
$ /Users/ckrycho/dev/oss/ts-repro/node_modules/.bin/tsc --extendedDiagnostics
Files:                  19
Lines:               26803
Nodes:              117316
Identifiers:         40636
Symbols:             35900
Types:               14334
Memory used:        80146K
I/O Read time:       0.01s
Parse time:          0.22s
Program time:        0.25s
Bind time:           0.11s
Check time:          0.70s
transformTime time:  0.01s
commentTime time:    0.00s
I/O Write time:      0.00s
printTime time:      0.02s
Emit time:           0.02s
Total time:          1.08s
✨  Done in 1.35s.
        1.55 real         2.45 user         0.14 sys
```

</details>

<details><summary><code>tsc --extendedDiagnostics</code> with <code>Maybe</code> (2.32s)</summary>

```sh
~> time yarn tsc --extendedDiagnostics
yarn run v1.13.0
$ /Users/ckrycho/dev/oss/ts-repro/node_modules/.bin/tsc --extendedDiagnostics
Files:                   19
Lines:                26803
Nodes:               117317
Identifiers:          40637
Symbols:             227496
Types:                81892
Memory used:        177576K
I/O Read time:        0.01s
Parse time:           0.22s
Program time:         0.26s
Bind time:            0.10s
Check time:           1.69s
transformTime time:   0.01s
commentTime time:     0.00s
I/O Write time:       0.00s
printTime time:       0.02s
Emit time:            0.02s
Total time:           2.07s
✨  Done in 2.32s.
        2.53 real         4.24 user         0.20 sys
```

</details>

### TS 3.2.4

(These are representative of results from 3.1+.)

<details><summary><code>tsc --extendedDiagnostics</code> with optional (1.34s)</summary>

```sh
~> time yarn tsc --extendedDiagnostics
yarn run v1.13.0
$ /Users/ckrycho/dev/oss/ts-repro/node_modules/.bin/tsc --extendedDiagnostics
Files:                  19
Lines:               27558
Nodes:              116904
Identifiers:         41691
Symbols:             34123
Types:               14678
Memory used:        79198K
I/O Read time:       0.01s
Parse time:          0.23s
Program time:        0.26s
Bind time:           0.10s
Check time:          0.70s
transformTime time:  0.01s
commentTime time:    0.00s
I/O Write time:      0.00s
printTime time:      0.02s
Emit time:           0.02s
Total time:          1.08s
✨  Done in 1.34s.
        1.53 real         2.37 user         0.13 sys
```

</details>

<details><summary><code>tsc --extendedDiagnostics</code> with <code>Maybe</code> (5.72s)</summary>

```sh
~> time yarn tsc --extendedDiagnostics
yarn run v1.13.0
$ /Users/ckrycho/dev/oss/ts-repro/node_modules/.bin/tsc --extendedDiagnostics
Files:                   19
Lines:                27558
Nodes:               116905
Identifiers:          41692
Symbols:             530722
Types:                94741
Memory used:        166905K
I/O Read time:        0.01s
Parse time:           0.27s
Program time:         0.31s
Bind time:            0.14s
Check time:           4.93s
transformTime time:   0.01s
commentTime time:     0.00s
I/O Write time:       0.00s
printTime time:       0.02s
Emit time:            0.02s
Total time:           5.40s
✨  Done in 5.72s.
        5.96 real         8.94 user         0.31 sys
```

</details>

## TS @next

Here things get weird: the performance regression is fixed, *and also* a conditional type which worked correctly from 2.8 forward no longer works correctly.

<details><summary><code>tsc --extendedDiagnostics</code> with optional (1.40s)</summary>

```sh
~> time yarn tsc --extendedDiagnostics
yarn run v1.13.0
$ /Users/ckrycho/dev/oss/ts-repro/node_modules/.bin/tsc --extendedDiagnostics
Files:                  19
Lines:               27622
Nodes:              117098
Identifiers:         41777
Symbols:             34500
Types:               14693
Memory used:        83325K
I/O Read time:       0.01s
Parse time:          0.23s
Program time:        0.27s
Bind time:           0.13s
Check time:          0.68s
transformTime time:  0.01s
commentTime time:    0.00s
I/O Write time:      0.00s
printTime time:      0.01s
Emit time:           0.01s
Total time:          1.09s
✨  Done in 1.40s.
        1.63 real         2.48 user         0.14 sys
```

</details>

<details><summary><code>tsc --extendedDiagnostics</code> with <code>Maybe</code> (1.42s)</summary>

```sh
~> time yarn tsc --extendedDiagnostics
yarn run v1.13.0
$ /Users/ckrycho/dev/oss/ts-repro/node_modules/.bin/tsc --extendedDiagnostics
index.ts:14:47 - error TS2741: Property 'email' is missing in type '{ age: RequiredField<number>; name: OptionalField<string>; }' but required in type 'Required<{ age: RequiredField<number>; name?: OptionalField<string> | undefined; email: RequiredField<Maybe<string>>; }>'.

14 const formFromUser: FromModel<User> = user => ({
                                                 ~~
15   age: Field.required({ value: user.age }),
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
16   name: Field.optional({ value: user.name })
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
17 });
   ~~

  index.ts:11:3
    11   email: Maybe<string>;
         ~~~~~
    'email' is declared here.
  node_modules/@olo/principled-forms/form.d.ts:80:36
    80 export declare type FromModel<T> = (model: T extends Maybe<infer U> ? Maybe<Partial<U>> : Partial<T>) => Form<T extends Maybe<infer U> ? U : T>;
                                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    The expected type comes from the return type of this signature.


Found 1 error.

Files:                  19
Lines:               27621
Nodes:              117085
Identifiers:         41772
Symbols:             34930
Types:               14786
Memory used:        80977K
I/O Read time:       0.01s
Parse time:          0.29s
Program time:        0.34s
Bind time:           0.13s
Check time:          0.93s
transformTime time:  0.01s
commentTime time:    0.00s
I/O Write time:      0.00s
printTime time:      0.02s
Emit time:           0.02s
Total time:          1.42s
error Command failed with exit code 2.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
        2.06 real         3.11 user         0.17 sys
```

</details>

---

Notice that the performace is not *good* in either case even in ~3.0, but regresses significantly for the `Maybe` case with the 3.1+ versions.