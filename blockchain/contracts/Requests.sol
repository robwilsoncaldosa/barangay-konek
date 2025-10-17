// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Requests {
    struct Request {
        uint256 id;
        uint256 certificateId;
        address resident;
        string purpose;
        string documentType;
        string status;
        uint256 timestamp;
    }

    uint256 public nextRequestId;
    mapping(uint256 => Request) public requests;

    event RequestRegistered(
        uint256 indexed id,
        uint256 certificateId,
        address indexed resident,
        string purpose,
        string documentType,
        string status,
        uint256 timestamp
    );

    // Register a request on-chain
    function registerRequest(
        uint256 certificateId,
        address resident,
        string memory purpose,
        string memory documentType
    ) external returns (uint256) {
        uint256 requestId = nextRequestId;
        requests[requestId] = Request({
            id: requestId,
            certificateId: certificateId,
            resident: resident,
            purpose: purpose,
            documentType: documentType,
            status: "completed",
            timestamp: block.timestamp
        });

        emit RequestRegistered(
            requestId,
            certificateId,
            resident,
            purpose,
            documentType,
            "completed",
            block.timestamp
        );

        nextRequestId++;
        return requestId;
    }

    // Optional: fetch a request
    function getRequest(uint256 requestId) external view returns (Request memory) {
        return requests[requestId];
    }
}
