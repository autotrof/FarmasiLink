# FarmasiLink Architecture - Service Pattern

## Roles
- **admin** - Manajemen penuh sistem
- **resepsionis** - Registrasi pasien, rekam medis
- **dokter** - Pemeriksaan, resep
- **apoteker** - Penerimaan resep

---

## Controller Types

### Resource Controllers (Full CRUD)
- `PatientController` - index, show, store, update, destroy

### Conventional Controllers with Custom Methods
- `ExaminationController` - Resource + custom uploadDocument
- `MedicineController` - Partial resource + custom priceHistory, refresh
- `PrescriptionController` - Partial resource + custom approve
- `UserController` - Resource + custom resetPassword
- `ProfileController` - Custom methods only
- `LogController` - Custom methods only

## Parameter Types

### ID Types in Services
- **Patient, Examination, Medicine, Prescription**: `string` (UUID)
- **User, Log**: `int` (auto-increment)

### Controller Pattern
- Controllers receive **Model** via Route Model Binding
- Controllers extract `$model->id` and pass to Service
- Services receive **primitive ID** (string or int)

Example:
```php
// Controller
public function show(Patient $patient): JsonResponse {
    $data = $this->patientService->getPatientById($patient->id); // Extract ID (string)
    return response()->json($data);
}

// Service
public function getPatientById(string $patientId): Patient {
    return Patient::findOrFail($patientId);
}
```

---

### 1. PatientController → PatientService
**Type:** Resource Controller  
**Actions:** Registrasi pasien, ubah data pasien

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| `index()` | `getPatients()` | resepsionis, admin | List semua pasien (paginated) |
| `show(Patient)` | `getPatientById()` | resepsionis, admin, dokter | Detail pasien + medical history |
| `store()` | `createPatient()` | resepsionis, admin | Daftar pasien baru |
| `update(Patient)` | `updatePatient()` | resepsionis, admin | Update data pasien |
| `destroy(Patient)` | `deletePatient()` | admin | Hapus data pasien |

---

### 2. ExaminationController → ExaminationService
**Type:** Resource Controller  
**Actions:** Pemeriksaan pasien, input rekam medis

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| `index()` | `getExaminations()` | dokter, admin | List pemeriksaan |
| `show(Examination)` | `getExaminationById()` | dokter, admin | Detail pemeriksaan + vital signs |
| `store()` | `createExamination()` | dokter | Buat pemeriksaan baru + vital signs |
| `update(Examination)` | `updateExamination()` | dokter | Update data pemeriksaan |
| `destroy(Examination)` | `deleteExamination()` | admin | Hapus pemeriksaan |
| **Custom:** `uploadDocument(Examination)` | `uploadDocument()` | dokter, resepsionis, admin | Upload dokumen rekam medis |

---

### 3. MedicineController → MedicineService
**Type:** Conventional Controller (custom methods)  
**Actions:** List obat, history harga, refresh data obat

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| `index()` | `getMedicines()` | dokter, apoteker, admin | List obat dengan harga terkini |
| `show(Medicine)` | `getMedicineById()` | dokter, apoteker, admin | Detail obat + harga terkini |
| **Custom:** `priceHistory(Medicine)` | `getPriceHistory()` | admin | History perubahan harga |
| **Custom:** `refresh()` | `syncMedicinesFromApi()` | admin | Refresh obat dari external API (from command) |

---

### 4. PrescriptionController → PrescriptionService
**Type:** Conventional Controller (custom methods)  
**Actions:** Buat resep, terima resep, update resep

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| `index()` | `getPrescriptions()` | dokter, apoteker, admin | List resep |
| `show(Prescription)` | `getPrescriptionById()` | dokter, apoteker, admin | Detail resep + items |
| `store()` | `createPrescription()` | dokter | Buat resep baru |
| `update(Prescription)` | `updatePrescription()` | dokter | Update resep (hanya status pending) |
| **Custom:** `approve(Prescription)` | `approvePrescription()` | apoteker | Terima & layani resep |

---

### 5. UserController → UserService
**Type:** Conventional Controller (custom methods)  
**Actions:** Manajemen user

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| `index()` | `getUsers()` | admin | List semua user |
| `show(User)` | `getUserById()` | admin | Detail user |
| `store()` | `createUser()` | admin | Buat user baru |
| `update(User)` | `updateUser()` | admin | Update data user |
| `destroy(User)` | `deleteUser()` | admin | Hapus user |
| **Custom:** `resetPassword(User)` | `resetUserPassword()` | admin | Reset password user |

---

### 6. ProfileController → ProfileService
**Type:** Conventional Controller (custom methods)  
**Actions:** Profil personal, ubah password

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| **Custom:** `show()` | `getAuthenticatedUser()` | semua | Lihat profil sendiri |
| **Custom:** `updatePassword()` | `changePassword()` | semua | Ubah password sendiri |

---

### 7. LogController → LogService
**Type:** Conventional Controller (custom methods)  
**Actions:** Log aktivitas

| Method | Service Method | Roles | Description |
|--------|---|---|---|
| **Custom:** `myLogs()` | `getMyLogs()` | semua | Lihat log aktivitas sendiri |
| **Custom:** `allLogs()` | `getAllLogs()` | admin | Lihat log semua user |

---

## Service Methods Summary

### PatientService
- `getPatients(perPage, page, filters)`
- `getPatientById(patientId)`
- `createPatient(data)`
- `updatePatient(patientId, data)`
- `deletePatient(patientId)`

### ExaminationService
- `getExaminations(perPage, page, filters)`
- `getExaminationById(examinationId)`
- `createExamination(data)`
- `updateExamination(examinationId, data)`
- `uploadDocument(examinationId, file)`

### MedicineService
- `getMedicines(perPage, page, filters)`
- `getMedicineById(medicineId)`
- `getPriceHistory(medicineId)`
- `syncMedicinesFromApi(callback)` ← dari FetchMedicines command

### PrescriptionService
- `getPrescriptions(perPage, page, filters)`
- `getPrescriptionById(prescriptionId)`
- `createPrescription(data)`
- `updatePrescription(prescriptionId, data)`
- `approvePrescription(prescriptionId, data)`

### UserService
- `getUsers(perPage, page, filters)`
- `getUserById(userId)`
- `createUser(data)`
- `updateUser(userId, data)`
- `deleteUser(userId)`
- `resetUserPassword(userId)`

### ProfileService
- `getAuthenticatedUser()`
- `changePassword(userId, oldPassword, newPassword)`

### LogService
- `storeLog(userId, action, model?, modelId?, description?)` ← Store log entry
- `getMyLogs(userId, perPage, page, filters)`
- `getAllLogs(perPage, page, filters)`
