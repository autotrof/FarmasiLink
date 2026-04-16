<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Resi Resep</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
        }
        body {
            font-family: monospace, sans-serif;
            font-size: 10px;
            margin: 15px;
            color: #000;
        }
        .header {
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 10px;
            border-bottom: 1px dashed #000;
            padding-bottom: 5px;
        }
        .info {
            margin-bottom: 10px;
        }
        .info table {
            width: 100%;
        }
        .info td {
            padding: 1px 0;
            vertical-align: top;
            font-size: 10px;
        }
        .items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .items th, .items td {
            text-align: left;
            padding: 2px 0;
            font-size: 10px;
        }
        .items th {
            border-bottom: 1px dashed #000;
        }
        .item-row td {
            padding-top: 4px;
        }
        .item-details {
            font-size: 9px;
            padding-left: 5px;
            color: #333;
        }
        .totals {
            margin-top: 10px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            text-align: right;
            font-weight: bold;
            font-size: 11px;
        }
        .footer {
            text-align: center;
            margin-top: 15px;
            font-size: 9px;
            border-top: 1px dashed #000;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        FARMASILINK KLINIK<br>
        Resi Pelayanan Resep
    </div>

    <div class="info">
        <table border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td width="25%"><strong>ID</strong></td>
                <td>: {{ substr($prescription->id, 0, 8) }}</td>
            </tr>
            <tr>
                <td><strong>Tgl</strong></td>
                <td>: {{ \Carbon\Carbon::parse($prescription->created_at)->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td><strong>Pasien</strong></td>
                <td>: {{ $prescription->examination->patient->name ?? '-' }}</td>
            </tr>
            <tr>
                <td><strong>Dokter</strong></td>
                <td>: {{ $prescription->examination->doctor->name ?? '-' }}</td>
            </tr>
            @if($prescription->served_by)
            <tr>
                <td><strong>Apoteker</strong></td>
                <td>: {{ $prescription->servedBy->name ?? '-' }}</td>
            </tr>
            @endif
        </table>
    </div>

    <table class="items" cellspacing="0" cellpadding="0">
        <thead>
            <tr>
                <th>Item</th>
                <th style="text-align: right;">Jml</th>
                <th style="text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($prescription->items as $item)
            <tr class="item-row">
                <td colspan="3"><strong>{{ $item->medicine->name }}</strong></td>
            </tr>
            <tr>
                <td>
                    <div class="item-details">
                        {{ $item->dosage }}<br>
                        {{ $item->instruction }}<br>
                        @ {{ number_format($item->unit_price, 0, ',', '.') }}
                    </div>
                </td>
                <td style="text-align: right; vertical-align: bottom;">{{ $item->quantity }}</td>
                <td style="text-align: right; vertical-align: bottom;">{{ number_format($item->quantity * $item->unit_price, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        Total: Rp {{ number_format($prescription->total, 0, ',', '.') }}
    </div>

    <div class="footer">
        Terima kasih atas kunjungan Anda.<br>
        Semoga lekas sembuh.
    </div>
</body>
</html>
