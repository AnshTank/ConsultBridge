@echo off
echo Fixing all database null check errors...

powershell -Command "(Get-Content 'src\app\api\appointments\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\appointments\route.ts'"

powershell -Command "(Get-Content 'src\app\api\category\[category]\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\category\[category]\route.ts'"

powershell -Command "(Get-Content 'src\app\api\clear-consultancies\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\clear-consultancies\route.ts'"

powershell -Command "(Get-Content 'src\app\api\consultancies\by-email\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\consultancies\by-email\route.ts'"

powershell -Command "(Get-Content 'src\app\api\consultancies\login\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\consultancies\login\route.ts'"

powershell -Command "(Get-Content 'src\app\api\consultancies\register\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\consultancies\register\route.ts'"

powershell -Command "(Get-Content 'src\app\api\consultancies\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\consultancies\route.ts'"

powershell -Command "(Get-Content 'src\app\api\consultancies\[id]\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\consultancies\[id]\route.ts'"

powershell -Command "(Get-Content 'src\app\api\consultancy\[id]\route.ts') -replace 'const db = mongoose.connection.db;', 'const db = mongoose.connection.db; if (!db) { throw new Error(''Database connection not established''); }' | Set-Content 'src\app\api\consultancy\[id]\route.ts'"

echo All database null checks fixed!
pause