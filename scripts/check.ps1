$log = git -C "c:\Users\DELL\OneDrive\Desktop\drip\Bazaar-2" log --oneline -20
$log | Out-File -FilePath "c:\Users\DELL\OneDrive\Desktop\drip\Bazaar-2\scripts\glog.txt" -Encoding utf8 -Force
