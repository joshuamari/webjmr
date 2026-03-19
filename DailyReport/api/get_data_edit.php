<?php
require_once "../../dbconn/dbconnectwebjmr.php";

header('Content-Type: application/json');

$primaryID = $_REQUEST['primaryID'] ?? '';

if ($primaryID === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing primaryID',
    ]);
    exit;
}

try {
    $query = "
        SELECT
            fldID,
            fldLocation,
            fldGroup,
            fldProject,
            fldItem,
            fldJobRequestDescription,
            fldDuration,
            fldMHType,
            fldTOW,
            fldRemarks,
            fld2D3D,
            fldRevision,
            fldChecker,
            fldTrGroup,
            fldGroupID
        FROM dailyreport
        WHERE fldID = :primaryID
        LIMIT 1
    ";

    $stmt = $connwebjmr->prepare($query);
    $stmt->execute([
        ':primaryID' => $primaryID,
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Entry not found',
        ]);
        exit;
    }

    $entryData = [
        'id' => $row['fldID'],
        'locationId' => $row['fldLocation'],
        'groupName' => $row['fldGroup'],
        'projectId' => $row['fldProject'],
        'itemId' => $row['fldItem'],
        'jobId' => $row['fldJobRequestDescription'],
        'durationMinutes' => $row['fldDuration'],
        'mhTypeId' => $row['fldMHType'],
        'towId' => $row['fldTOW'],
        'remarks' => $row['fldRemarks'],
        'twoThreeId' => $row['fld2D3D'],
        'isRevision' => (int)$row['fldRevision'],
        'checkerId' => $row['fldChecker'],
        'trainingGroupId' => $row['fldTrGroup'],
        'groupId' => $row['fldGroupID'],
    ];

    echo json_encode([
        'success' => true,
        'data' => $entryData,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load entry data',
    ]);
}
?>