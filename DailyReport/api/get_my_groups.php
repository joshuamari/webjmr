<?php

require_once __DIR__ . '/bootstrap.php';

$empNum = requireRequestValue('empNum', 'Employee number is required.');

try {
    $query = "
        SELECT
            grList.id,
            grList.abbreviation
        FROM employee_list AS emplist
        INNER JOIN employee_group AS empgroup
            ON empgroup.employee_number = emplist.id
        INNER JOIN group_list AS grList
            ON grList.id = empgroup.group_id
        WHERE emplist.id = :empNum
        ORDER BY grList.abbreviation ASC
    ";

    $stmt = $connnew->prepare($query);
    $stmt->execute([
        ':empNum' => $empNum,
    ]);

    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonSuccess($groups);
} catch (Throwable $e) {
    jsonError('Failed to load user groups.', 500);
}