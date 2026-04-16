<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Resepsionis = 'resepsionis';
    case Dokter = 'dokter';
    case Apoteker = 'apoteker';

    public function label(): string
    {
        return match ($this) {
            UserRole::Admin => 'Admin',
            UserRole::Resepsionis => 'Resepsionis',
            UserRole::Dokter => 'Dokter',
            UserRole::Apoteker => 'Apoteker',
        };
    }
}
