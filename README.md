# vulnerabilities in finalsclub.io

## overview

This repository contains a [full technical report](https://github.com/anitejb/finalsclub/blob/master/report.md) regarding a security vulnerability discovered in [FinalsClub](https://finalsclub.io), a messaging platform for students of Rutgers University, launched in January 2020. This was a joint effort by Anitej Biradar ([@anitejb](https://github.com/anitejb)), [@mmatlin](https://github.com/mmatlin), and Lincoln Roth ([@lincolnmroth](https://github.com/lincolnmroth)).

## aftermath and disclaimer

FinalsClub Responsible Disclosure Guidelines: [finalsclub.io/security.html](https://finalsclub.io/security.html)

Since the preparation and delivery of this report, it is our understanding that the developers at FinalsClub have taken steps to resolve the highlighted issues and vulnerabilities. The platform was taken down on 02/03/2020, and was brought back on 03/13/2020 with an updated, more comprehensive Terms of Service and Privacy Policy, and removed support for the website (now limited to Android and iOS apps only). When we initially explored the platform, we did not violate any of the Terms of Service, and we took steps to ensure that the developers of the platform were informed of the vulnerabilities promptly (following the provided Responsible Disclosure Guidelines). 

After the update, under the new comprehensive Terms of Service, users are prohibited from attempting to "Decipher, decompile, disassemble, or reverse engineer any of the software comprising or in anyway making up a part of the Site." While the Security notice remains the same, valuing the work done by security researchers and encouraging the community to participate in the platform's responsible reporting process, it is evident that any attempt to understand the inner workings of the site is a clear violation of the Terms of Service.

## structure

The full report is titled `report.md` and can be found in the top level of the repository.

Under the `users` and `messages` folder, you can find the code that we used to test the extent of the vulnerabilities. The identifiable data from the code has been redacted, including emails/logins, passwords, and platform-assigned UIDs. This code is not meant to be run, it is simply provided to supplement the technical report as reference material.

Documents from before 02/03/2020 are in the `original_documents` folder. You can find a copy of the EULA (End User License Agreement) from the platform's mobile app, which was also on the website's Terms of Service. In addition, you can also find the Privacy Policy from on the platform's App Store listing, as well as Responsible Disclosure Guidelines provided to us by the platform.

Documents from after 02/04/2020 are in the `updated_documents` folder. These documents were retrieved from [finalsclub.io](https://finalsclub.io) on 03/16/2020. Again, this includes a copy of the Terms of Service, Privacy Policy, and Product Security Guidelines. It can be observed that the Terms of Service and Privacy Policy have been heavily upgraded, while the Responsible Disclosure Guidelines remained the same. The latest versions of these documents can be found at the following links:
- Terms of Service: [finalsclub.io/terms.html](https://finalsclub.io/terms.html)
- Privacy Policy: [finalsclub.io/privacy.html](https://finalsclub.io/privacy.html)
- Responsible Disclosure Guidelines: [finalsclub.io/security.html](https://finalsclub.io/security.html)