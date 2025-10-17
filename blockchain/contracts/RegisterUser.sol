// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract RegisterUser {
    struct User {
        string name;
        string role; // "citizen" or "official"
        address userAddress;
        uint256 createdAt;
    }

    mapping(address => User) public users;

    event UserRegistered(address indexed userAddress, string name, string role, uint256 createdAt);

    function register(string memory _name, string memory _role) public {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_role).length > 0, "Role required");
        require(users[msg.sender].userAddress == address(0), "Already registered");

        users[msg.sender] = User({
            name: _name,
            role: _role,
            userAddress: msg.sender,
            createdAt: block.timestamp
        });

        emit UserRegistered(msg.sender, _name, _role, block.timestamp);
    }

    function getUser(address _user) public view returns (User memory) {
        return users[_user];
    }
}
