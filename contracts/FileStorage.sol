// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    mapping(address=>string[]) 
    public userFiles;
    
    function storeFileHash(string memory _ipfsHash)  public {
        userFiles[msg.sender].push(_ipfsHash);
    }

    function getFiles()  public view returns (string[] memory) {
        return userFiles[msg.sender];        
    }
}