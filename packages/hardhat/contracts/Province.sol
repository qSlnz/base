// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.4;

/*
    Chaque province a une certaine taille, et chaque case de la province a un type et des données associés au type.
    City => adresse du contrat de la ville
    Forest => nombre d'arbres sur la case
    Road => pas de données
    Mountain => pas de données
*/

contract Province {
    enum provinceTileType {CITY, FOREST, ROAD, MOUNTAIN}

    uint8 provinceSizeX = 12;
    uint8 provinceSizeY = 12;

    /* var[id][X][Y] */

    mapping(uint16 => mapping(uint8 => mapping(uint8 => provinceTileType))) tiles;
    mapping(uint16 => mapping(uint8 => mapping(uint8 => uint256))) data;

    constructor() {}
}
