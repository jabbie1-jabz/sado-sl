# Netlify Site Rename Script
# This script will help rename your Netlify site to "sado-sl"

$siteId = "effulgent-pastelito-2bc023"
$newName = "sado-sl"
$apiUrl = "https://api.netlify.com/api/v1/sites/$siteId"

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║           NETLIFY SITE RENAME SCRIPT FOR SADO-SL            ║
╚══════════════════════════════════════════════════════════════╝

Current Site ID: $siteId
New Site Name:   $newName
New URL:         https://$newName.netlify.app

To complete the rename, you have TWO options:

OPTION 1: Manual Rename (Requires Netlify Dashboard Access)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Steps:
1. Go to: https://app.netlify.com/sites/$siteId/settings/general
2. Find the "Site name" field
3. Change it from "$siteId" to "$newName"
4. Click SAVE

Your new URL will be: https://$newName.netlify.app/customer.html


OPTION 2: Programmatic Rename (Requires API Token)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you have a Netlify Personal Access Token, run:

`$token = "YOUR_NETLIFY_TOKEN"
`$body = @{ name = "$newName" } | ConvertTo-Json
`$headers = @{ Authorization = "Bearer `$token" }
Invoke-RestMethod -Method PATCH -Uri "$apiUrl" -Body `$body -Headers `$headers -ContentType "application/json"

After this command, your site will be at: https://$newName.netlify.app


CURRENT STATUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Website:  https://$siteId.netlify.app/customer.html
✅ Admin:    https://$siteId.netlify.app/admin.html
✅ All files deployed and working worldwide


WHAT HAPPENS AFTER RENAME:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Website: https://$newName.netlify.app/customer.html
✅ Admin:   https://$newName.netlify.app/admin.html
✅ Old URL will STOP working
✅ New URL will be active immediately

"@
