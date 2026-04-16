<?php

namespace App\Services;

use App\Models\Examination;
use App\Models\Patient;
use App\Models\Prescription;

class DashboardService
{
    /**
     * Get dashboard statistics.
     *
     * @return array<string, mixed>
     */
    public function getDashboardStats(int $month, int $year): array
    {
        $totalPatients = $this->getTotalPatients();
        $examinationCount = $this->getExaminationCountByMonth($month, $year);
        $medicinePurchaseTotal = $this->getMedicinePurchaseTotalByMonth($month, $year);

        return [
            'total_patients' => $totalPatients,
            'examination_count' => $examinationCount,
            'medicine_purchase_total' => $medicinePurchaseTotal,
            'month' => $month,
            'year' => $year,
        ];
    }

    /**
     * Get total number of registered patients.
     */
    private function getTotalPatients(): int
    {
        return Patient::count();
    }

    /**
     * Get examination count for a specific month.
     */
    private function getExaminationCountByMonth(int $month, int $year): int
    {
        return Examination::whereYear('examination_date', $year)
            ->whereMonth('examination_date', $month)
            ->count();
    }

    /**
     * Get total medicine purchase amount for a specific month.
     */
    private function getMedicinePurchaseTotalByMonth(int $month, int $year): float|int
    {
        return Prescription::whereYear('served_date', $year)
            ->whereMonth('served_date', $month)
            ->where('status', 'served')
            ->sum('total');
    }
}
