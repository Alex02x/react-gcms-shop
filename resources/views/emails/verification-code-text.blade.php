{{ __('auth.email.greeting') }}

{{ __('auth.email.sign_in_request') }}

{{ __('auth.email.verification_code') }}

{{ $code }}

{{ __('auth.email.security_notice', ['minutes' => 10]) }}

{{ __('auth.email.ignore_message') }}

For security reasons, please do not share this code with anyone.

{{ __('auth.email.automated_message') }}

---
{{ strip_tags(__('auth.email.copyright', ['year' => date('Y')])) }}
