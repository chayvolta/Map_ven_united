$path = "d:\OneDrive - FONATUR\Comercialización\1001. Dirección de Fomento a la Inversión\100. Geportales\08. Fitur\Vanilla\react-viewer\public\360\Loreto"
Get-ChildItem $path -Directory | ForEach-Object {
    if ($_.Name -match "__$") {
        $newName = $_.Name -replace "__$", ""
        $newPath = Join-Path $path $newName
        Write-Host "Renaming $($_.FullName) to $newPath"
        Rename-Item -Path $_.FullName -NewName $newName
    }
}
