<?php

namespace App\Console\Commands;

use App\Services\MedicineService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:fetch-medicines')]
#[Description('Fetch medicines and prices from external API')]
class FetchMedicines extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(MedicineService $medicineService): int
    {
        $this->info('Starting medicine sync process...');
        $this->newLine();

        try {
            $medicineService->fetchAndSyncMedicines(
                fn ($message) => $this->line($message)
            );

            $this->newLine();
            $this->info('✓ Medicine sync completed successfully!');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('✗ Error: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
