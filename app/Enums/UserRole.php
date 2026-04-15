<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Dokter = 'dokter';
    case Apoteker = 'apoteker';

    public function label(): string
    {
        return match ($this) {
            UserRole::Admin => 'Admin',
            UserRole::Dokter => 'Dokter',
            UserRole::Apoteker => 'Apoteker',
        };
    }
}
