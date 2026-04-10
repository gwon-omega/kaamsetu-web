# Auth Session Mermaid Flowcharts

This document captures auth session flowcharts for each sub-task in the web auth flow.

## 0. Combined Login UI UX Flow

```mermaid
flowchart LR
  S([Start]) --> A[Open login page]
  A --> B{Choose login method}

  B -- Email --> E1[Enter email]
  E1 --> E2[Enter password]
  E2 --> E3[Submit email login]
  E3 --> E4{Credentials valid}
  E4 -- No --> E5[Show email or password error]
  E5 --> E1
  E4 -- Yes --> E6[Create session]
  E6 --> E7[Navigate to profile]
  E7 --> X([End])

  B -- Phone --> P1[Enter phone number]
  P1 --> P2[Submit send OTP]
  P2 --> P3{Phone valid and OTP sent}
  P3 -- No --> P4[Show phone or OTP send error]
  P4 --> P1
  P3 -- Yes --> P5[Open OTP input step]
  P5 --> P6[Enter OTP]
  P6 --> P7[Submit OTP verify]
  P7 --> P8{OTP valid}
  P8 -- No --> P9[Show OTP verification error]
  P9 --> P6
  P8 -- Yes --> P10[Create session]
  P10 --> P11[Navigate to profile]
  P11 --> X
```

## 1. Initialize Auth Session on App Start

```mermaid
flowchart LR
  S([Start]) --> A[Call initialize]
  A --> B{Supabase configured}

  B -- No --> C[Clear user and session]
  C --> D[Set auth false and loading false]
  D --> E[Set error login currently unavailable]
  E --> X([End])

  B -- Yes --> F[Create Supabase client]
  F --> G[Get current session]
  G --> H{Session request succeeded}

  H -- No --> I[Set auth service unavailable error]
  I --> X

  H -- Yes --> J[Map session to app model]
  J --> K[Write session user and auth flags]
  K --> L{Listener already bound}
  L -- No --> M[Bind auth state change listener]
  M --> N[Mark listener bound]
  N --> X
  L -- Yes --> X
```

## 2. Phone OTP Request

```mermaid
flowchart LR
  S([Start Phone OTP]) --> A[User enters Nepal mobile number]
  A --> B[Submit send OTP]
  B --> C{Backend configured}

  C -- No --> D[Show login temporarily unavailable]
  D --> X([End])

  C -- Yes --> E{Phone format valid}
  E -- No --> F[Show invalid Nepal number]
  F --> X

  E -- Yes --> G[Call store login with phone only]
  G --> H{Store Supabase configured}

  H -- No --> I[Set login unavailable error]
  I --> X

  H -- Yes --> J[Create Supabase client]
  J --> K[Request OTP with country code]
  K --> L{OTP request success}

  L -- No --> M[Set failed to send OTP error]
  M --> X

  L -- Yes --> N[Move UI to OTP step]
  N --> X
```

## 3. OTP Verification and Session Create

```mermaid
flowchart LR
  S([Start OTP Verify]) --> A[User enters six digit OTP]
  A --> B[Submit verify]
  B --> C{Backend configured}

  C -- No --> D[Show login temporarily unavailable]
  D --> X([End])

  C -- Yes --> E{OTP length valid}
  E -- No --> F[Show six digit OTP required]
  F --> X

  E -- Yes --> G[Call store login with phone and OTP]
  G --> H[Verify OTP using auth API]
  H --> I[Map returned session]
  I --> J{Mapped session exists}

  J -- No --> K[Set OTP verification failed error]
  K --> X

  J -- Yes --> L[Set session user and auth true]
  L --> M[Navigate to profile page]
  M --> X
```

## 4. Email Password Login

```mermaid
flowchart LR
  S([Start Email Login]) --> A[User enters email and password]
  A --> B[Submit email login]
  B --> C{Backend configured}

  C -- No --> D[Show login temporarily unavailable]
  D --> X([End])

  C -- Yes --> E{Email format valid}
  E -- No --> F[Show enter valid email]
  F --> X

  E -- Yes --> G{Password length valid}
  G -- No --> H[Show password length error]
  H --> X

  G -- Yes --> I[Call store loginWithEmail]
  I --> J{Store Supabase configured}

  J -- No --> K[Set login unavailable error]
  K --> X

  J -- Yes --> L[Create Supabase client]
  L --> M[Call signInWithPassword]
  M --> N[Map returned session]
  N --> O{Mapped session exists}

  O -- No --> P[Set email login failed error]
  P --> X

  O -- Yes --> Q[Set session user and auth true]
  Q --> R[Navigate to profile page]
  R --> X
```

## 5. Session Mapping Rules Including Admin

```mermaid
flowchart LR
  S([Raw Supabase Session]) --> A{Session object valid}

  A -- No --> Z([Return null])

  A -- Yes --> B{Access token and user id present}
  B -- No --> Z

  B -- Yes --> C[Read user metadata]
  C --> D{Role is worker or hirer or admin}

  D -- Yes --> E[Use metadata role]
  D -- No --> F[Use default role hirer]

  E --> G[Resolve phone from user then metadata]
  F --> G

  G --> H{Phone confirmed or email confirmed}
  H -- Yes --> I[Set user verified true]
  H -- No --> J[Set user verified false]

  I --> K[Build AuthSession model]
  J --> K

  K --> L[Preserve user id and role including admin]
  L --> Y([Return mapped session])
```

## 6. Auth State Change Listener

```mermaid
flowchart LR
  S([After initialize session fetch]) --> A{Listener already bound}

  A -- Yes --> X([End])

  A -- No --> B[Bind auth state change callback]
  B --> C[Receive auth event]
  C --> D[Map session from callback]
  D --> E[Update session user and auth flags]
  E --> F[Clear auth error]
  F --> G[Set listener bound true]
  G --> X
```

## 7. Logout and Local Cleanup

```mermaid
flowchart LR
  S([Start Logout]) --> A{Supabase configured}

  A -- Yes --> B[Create Supabase client]
  B --> C[Call signOut]
  C --> D{Sign out error}
  D -- Yes --> E[Log sign out failure]
  D -- No --> F[Continue]
  E --> F

  A -- No --> F

  F --> G[Clear user]
  G --> H[Clear session]
  H --> I[Set auth false and loading false]
  I --> J[Clear auth error]
  J --> X([End])
```

## 8. Admin ID Email Login Smoke Test

```mermaid
flowchart LR
  S([Start Test]) --> A[Mock signInWithPassword with admin session]
  A --> B[Call loginWithEmail with admin credentials]
  B --> C[Expect function result true]
  C --> D[Expect API call arguments match]
  D --> E[Read store state]
  E --> F[Assert auth true]
  F --> G[Assert user id is admin id]
  G --> H[Assert role is admin]
  H --> I[Assert verified true]
  I --> X([End])
```
