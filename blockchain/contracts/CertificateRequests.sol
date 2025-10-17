// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRequests {
    struct Request {
        uint256 id;
        uint256 certificateId;
        uint256 residentId;
        string documentType;
        string purpose;
        string priority;
        uint256 timestamp;
    }

    Request[] public requests;
    uint256 public nextId = 1;

    event RequestAdded(uint256 id, uint256 certificateId, uint256 residentId);

    function addRequest(
        uint256 certificateId,
        uint256 residentId,
        string memory documentType,
        string memory purpose,
        string memory priority
    ) public {
        requests.push(Request(nextId, certificateId, residentId, documentType, purpose, priority, block.timestamp));
        emit RequestAdded(nextId, certificateId, residentId);
        nextId++;
    }

    function getRequests() public view returns (Request[] memory) {
        return requests;
    }
}
