# Rename folders script
$basePath = "D:\OneDrive - FONATUR\Comercialización\1001. Dirección de Fomento a la Inversión\100. Geportales\08. Fitur\Vanilla\react-viewer\public\360\Loreto"

Get-ChildItem -Path $basePath -Directory | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName -replace "Ø", "_"
    if ($oldName -ne $newName) {
        Rename-Item -Path $_.FullName -NewName $newName
        Write-Host "Renamed: $oldName -> $newName"
    }
}
