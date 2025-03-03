// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Neural Network Avalanche Game Contract
 * @dev Stores neural network configurations and player scores on the Avalanche blockchain
 */
contract NeuralNetworkContract {
    // Struct to store neural network data
    struct NeuralNetwork {
        string networkHash;      // Hash of the network configuration
        uint256 inputNeurons;    // Number of input neurons
        uint256 hiddenNeurons;   // Number of hidden neurons
        uint256 outputNeurons;   // Number of output neurons
        string activationFunction; // Activation function used
        uint256 accuracy;        // Network accuracy (scaled by 10000)
        uint256 timestamp;       // When the network was saved
    }
    
    // Struct to store player score data
    struct PlayerScore {
        address player;          // Player wallet address
        uint256 score;           // Total score (scaled by 100)
        uint256 accuracy;        // Accuracy percentage (scaled by 10000)
        uint256 efficiency;      // Efficiency score (scaled by 100)
        uint256 innovation;      // Innovation score (scaled by 100)
        string networkHash;      // Reference to the network used
        uint256 timestamp;       // When the score was recorded
    }
    
    // Struct to store badge data
    struct Badge {
        string badgeType;        // Type of badge (e.g., "color-master")
        string name;             // Display name
        string description;      // Badge description
        uint256 levelRequired;   // Game level required to earn
    }
    
    // Mapping from player address to their scores
    mapping(address => PlayerScore[]) private playerScores;
    
    // Mapping from network hash to neural network data
    mapping(string => NeuralNetwork) private networks;
    
    // Mapping from player address to their badges
    mapping(address => string[]) private playerBadges;
    
    // Array of all player scores for leaderboard
    PlayerScore[] private allScores;
    
    // Available badges
    Badge[] private availableBadges;
    
    // Events
    event ScoreSubmitted(address indexed player, uint256 score, uint256 accuracy);
    event NetworkSaved(address indexed player, string networkHash, uint256 accuracy);
    event BadgeAwarded(address indexed player, string badgeType);
    
    // Contract owner
    address private owner;
    
    constructor() {
        owner = msg.sender;
        
        // Initialize available badges
        availableBadges.push(Badge({
            badgeType: "color-master",
            name: "Color Master",
            description: "Successfully completed the RGB Color Classification challenge",
            levelRequired: 1
        }));
        
        availableBadges.push(Badge({
            badgeType: "pattern-master",
            name: "Pattern Master",
            description: "Successfully completed the Pattern Recognition challenge",
            levelRequired: 2
        }));
        
        availableBadges.push(Badge({
            badgeType: "efficiency-expert",
            name: "Efficiency Expert",
            description: "Successfully completed the Efficiency challenge",
            levelRequired: 3
        }));
    }
    
    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }
    
    /**
     * @dev Submit a player's score
     * @param score Total score (scaled by 100)
     * @param accuracy Accuracy percentage (scaled by 10000)
     * @param efficiency Efficiency score (scaled by 100)
     * @param innovation Innovation score (scaled by 100)
     * @param networkHash Reference to the network configuration
     * @param level The game level this score is for
     */
    function submitScore(
        uint256 score,
        uint256 accuracy,
        uint256 efficiency,
        uint256 innovation,
        string memory networkHash,
        uint256 level
    ) external {
        // Create new score entry
        PlayerScore memory newScore = PlayerScore({
            player: msg.sender,
            score: score,
            accuracy: accuracy,
            efficiency: efficiency,
            innovation: innovation,
            networkHash: networkHash,
            timestamp: block.timestamp
        });
        
        // Add to player's scores
        playerScores[msg.sender].push(newScore);
        
        // Add to all scores for leaderboard
        allScores.push(newScore);
        
        // Award badges based on level completion
        if (accuracy >= 8500) { // 85% accuracy threshold
            if (level == 1) {
                _awardBadge(msg.sender, "color-master");
            } else if (level == 2) {
                _awardBadge(msg.sender, "pattern-master");
            } else if (level == 3) {
                _awardBadge(msg.sender, "efficiency-expert");
            }
        }
        
        // Emit event
        emit ScoreSubmitted(msg.sender, score, accuracy);
    }
    
    /**
     * @dev Save a neural network configuration
     * @param networkHash Hash of the network configuration
     * @param inputNeurons Number of input neurons
     * @param hiddenNeurons Number of hidden neurons
     * @param outputNeurons Number of output neurons
     * @param activationFunction Activation function used
     * @param accuracy Network accuracy (scaled by 10000)
     */
    function saveNetwork(
        string memory networkHash,
        uint256 inputNeurons,
        uint256 hiddenNeurons,
        uint256 outputNeurons,
        string memory activationFunction,
        uint256 accuracy
    ) external {
        // Create new network entry
        NeuralNetwork memory newNetwork = NeuralNetwork({
            networkHash: networkHash,
            inputNeurons: inputNeurons,
            hiddenNeurons: hiddenNeurons,
            outputNeurons: outputNeurons,
            activationFunction: activationFunction,
            accuracy: accuracy,
            timestamp: block.timestamp
        });
        
        // Save network
        networks[networkHash] = newNetwork;
        
        // Emit event
        emit NetworkSaved(msg.sender, networkHash, accuracy);
    }
    
    /**
     * @dev Award a badge to a player
     * @param player Address of the player
     * @param badgeType Type of badge to award
     */
    function _awardBadge(address player, string memory badgeType) private {
        // Check if player already has this badge
        string[] storage badges = playerBadges[player];
        for (uint i = 0; i < badges.length; i++) {
            if (keccak256(bytes(badges[i])) == keccak256(bytes(badgeType))) {
                return; // Player already has this badge
            }
        }
        
        // Award new badge
        playerBadges[player].push(badgeType);
        
        // Emit event
        emit BadgeAwarded(player, badgeType);
    }
    
    /**
     * @dev Get a player's scores
     * @param player Address of the player
     * @return Array of player scores
     */
    function getPlayerScores(address player) external view returns (PlayerScore[] memory) {
        return playerScores[player];
    }
    
    /**
     * @dev Get a player's best score
     * @param player Address of the player
     * @return The player's best score or empty score if none exists
     */
    function getPlayerBestScore(address player) external view returns (PlayerScore memory) {
        PlayerScore[] memory scores = playerScores[player];
        
        if (scores.length == 0) {
            // Return empty score if player has no scores
            return PlayerScore({
                player: address(0),
                score: 0,
                accuracy: 0,
                efficiency: 0,
                innovation: 0,
                networkHash: "",
                timestamp: 0
            });
        }
        
        // Find best score
        uint256 bestIndex = 0;
        for (uint i = 1; i < scores.length; i++) {
            if (scores[i].score > scores[bestIndex].score) {
                bestIndex = i;
            }
        }
        
        return scores[bestIndex];
    }
    
    /**
     * @dev Get a neural network by hash
     * @param networkHash Hash of the network
     * @return The neural network data
     */
    function getNetwork(string memory networkHash) external view returns (NeuralNetwork memory) {
        return networks[networkHash];
    }
    
    /**
     * @dev Get a player's badges
     * @param player Address of the player
     * @return Array of badge types
     */
    function getPlayerBadges(address player) external view returns (string[] memory) {
        return playerBadges[player];
    }
    
    /**
     * @dev Get top scores for leaderboard
     * @param count Number of top scores to return
     * @return Array of top scores
     */
    function getTopScores(uint256 count) external view returns (PlayerScore[] memory) {
        // Determine how many scores to return
        uint256 resultCount = count;
        if (allScores.length < count) {
            resultCount = allScores.length;
        }
        
        // Create result array
        PlayerScore[] memory result = new PlayerScore[](resultCount);
        
        // If no scores, return empty array
        if (resultCount == 0) {
            return result;
        }
        
        // Copy scores to a memory array for sorting
        PlayerScore[] memory scoresCopy = new PlayerScore[](allScores.length);
        for (uint i = 0; i < allScores.length; i++) {
            scoresCopy[i] = allScores[i];
        }
        
        // Sort scores (simple bubble sort)
        for (uint i = 0; i < scoresCopy.length; i++) {
            for (uint j = i + 1; j < scoresCopy.length; j++) {
                if (scoresCopy[i].score < scoresCopy[j].score) {
                    // Swap
                    PlayerScore memory temp = scoresCopy[i];
                    scoresCopy[i] = scoresCopy[j];
                    scoresCopy[j] = temp;
                }
            }
        }
        
        // Copy top scores to result
        for (uint i = 0; i < resultCount; i++) {
            result[i] = scoresCopy[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get all available badges
     * @return Array of all badges
     */
    function getAvailableBadges() external view returns (Badge[] memory) {
        return availableBadges;
    }
}