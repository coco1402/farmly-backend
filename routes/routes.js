const express = require('express');
const router = express.Router()
const FarmModel = require('../model/farmModel');
const UserModel = require('../model/userModel');
const { verifyToken, requireFarmer } = require('../middleware/auth');
const upload = require('../middleware/upload');

//Post Method - Protected: Only authenticated farmers can create farms
router.post('/farms', verifyToken, requireFarmer, async(req, res) => {
    const data = new FarmModel ({
        name: req.body.name,
        address: req.body.address,
        description: req.body.description,
        profile_pic: req.body.profile_pic,
        username: req.body.username,
        user_id: req.body.user_id || "0",
        distance_from_location: req.body.distance_from_location || 0,
        rating: req.body.rating || [],
        produce: req.body.produce || []
    })
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

//Get all farms
router.get('/farms', async (req, res) => {
    try {
        const farms = await FarmModel.find();
        res.json(farms);
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Get farm by ID
router.get('/farms/:id', async (req, res) => {
    try {
        const farm = await FarmModel.findById(req.params.id);
        if (!farm) {
            return res.status(404).json({ message: "Farm not found" });
        }
        res.json(farm);
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
})

//Update by ID Method - Protected: Only authenticated users can update
router.patch('/farms/:id', /* verifyToken, */ async (req, res) => {
    try {
        const id = req.params.id
        const updatedData = req.body
        const options = { new: true }

        const result = await FarmModel.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message})
    }
})

//Delete by ID Method - Protected: Only authenticated users can delete
router.delete('/farms/:id', /* verifyToken, */ async (req, res) => {
    try {
        const id = req.params.id
        const data = await FarmModel.findByIdAndDelete(id)

        res.send(`${data.name} has been deleted from the list of farms.`)
    }
    catch (error) {
        res.status(400).json({ message: error.message})
    }
})

// Get all produce
router.get('/produce', async (req, res) => {
    try {
        const farms = await FarmModel.find();
        const allProduce = [];
        farms.forEach(farm => {
            if (farm.produce) {
                farm.produce.forEach(item => {
                    allProduce.push({
                        ...item,
                        farm_id: farm._id,
                        farm_name: farm.name
                    });
                });
            }
        });
        res.json(allProduce);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Post new produce - Add produce to a farm
router.post('/produce', async (req, res) => {
    try {
        const { farm_id, ...produceData } = req.body;
        
        // Find the farm by ID
        const farm = await FarmModel.findById(farm_id);
        if (!farm) {
            return res.status(404).json({ message: "Farm not found" });
        }
        
        // Add the produce to the farm's produce array
        if (!farm.produce) {
            farm.produce = [];
        }
        
        // Create produce object with unique ID
        const newProduce = {
            _id: new Date().getTime().toString(), // Simple ID generation
            ...produceData
        };
        
        farm.produce.push(newProduce);
        
        // Save the updated farm
        const updatedFarm = await farm.save();
        
        // Return the newly added produce
        res.status(201).json({
            ...newProduce,
            farm_id: farm._id,
            farm_name: farm.name
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create user
router.post('/users', async (req, res) => {
    try {
        const user = new UserModel({
            user_id: req.body.user_id,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            profile_pic: req.body.profile_pic,
            postcode: req.body.postcode,
            user_type: req.body.user_type
        });
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update user by ID
router.patch('/users/:id', /* verifyToken, */ async (req, res) => {
    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { user_id: req.params.id },
            req.body,
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get produce by ID
router.get('/produce/:id', async (req, res) => {
    try {
        const produceId = req.params.id;
        
        // Find all farms and look for the produce item
        const farms = await FarmModel.find();
        let foundProduce = null;
        let foundFarm = null;
        
        // Search through all farms to find the produce item
        for (let farm of farms) {
            if (farm.produce && farm.produce.length > 0) {
                const produce = farm.produce.find(item => {
                    return item._id === produceId || item._id.toString() === produceId;
                });
                
                if (produce) {
                    foundProduce = produce;
                    foundFarm = farm;
                    break;
                }
            }
        }
        
        if (!foundProduce) {
            return res.status(404).json({ message: "Produce not found" });
        }

        // Convert to plain object and return
        const produceObj = foundProduce.toObject ? foundProduce.toObject() : foundProduce;

        // Return the produce with farm info
        res.json([{
            ...produceObj,
            farm_id: foundFarm._id,
            farm_name: foundFarm.name
        }]);
    } catch (error) {
        // Error getting produce
        res.status(500).json({ message: error.message });
    }
});

// Update produce by ID
router.patch('/produce/:id', async (req, res) => {
    try {
        const produceId = req.params.id;
        const updateData = req.body;
        
        // Find all farms and look for the produce item
        const farms = await FarmModel.find();
        let foundFarm = null;
        let produceIndex = -1;
        
        // Search through all farms to find the produce item
        for (let farm of farms) {
            if (farm.produce && farm.produce.length > 0) {
                produceIndex = farm.produce.findIndex(item => item._id === produceId);
                if (produceIndex !== -1) {
                    foundFarm = farm;
                    break;
                }
            }
        }
        
        if (!foundFarm || produceIndex === -1) {
            return res.status(404).json({ message: "Produce not found" });
        }
        
        // Update the produce item
        Object.assign(foundFarm.produce[produceIndex], updateData);
        
        // Save the updated farm
        await foundFarm.save();
        
        // Return the updated produce
        res.json([{
            ...foundFarm.produce[produceIndex],
            farm_id: foundFarm._id,
            farm_name: foundFarm.name
        }]);
    } catch (error) {
        // Error updating produce
        res.status(500).json({ message: error.message });
    }
});

// Delete produce by ID
router.delete('/produce/:id', async (req, res) => {
    try {
        const produceId = req.params.id;

        // Find all farms and look for the produce item
        const farms = await FarmModel.find();
        let foundFarm = null;
        let produceIndex = -1;

        // Search through all farms to find the produce item
        for (let farm of farms) {
            if (farm.produce && farm.produce.length > 0) {
                produceIndex = farm.produce.findIndex(item => item._id === produceId);
                if (produceIndex !== -1) {
                    foundFarm = farm;
                    break;
                }
            }
        }

        if (!foundFarm || produceIndex === -1) {
            return res.status(404).json({ message: "Produce not found" });
        }

        // Get the produce item before removing it
        const deletedProduce = foundFarm.produce[produceIndex];

        // Remove the produce item from the array
        foundFarm.produce.splice(produceIndex, 1);

        // Save the updated farm
        await foundFarm.save();

        res.status(200).json({
            message: "Produce deleted successfully",
            deletedProduce: deletedProduce
        });
    } catch (error) {
        // Error deleting produce
        res.status(500).json({ message: error.message });
    }
});

// Upload image endpoint
router.post('/upload', (req, res, next) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            return res.status(500).json({
                message: 'Upload failed',
                error: err.message,
                type: err.name
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            // Return the URL path for the uploaded image
            const imageUrl = `/uploads/${req.file.filename}`;
            res.status(200).json({
                message: 'Image uploaded successfully',
                imageUrl: imageUrl,
                filename: req.file.filename
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
});

module.exports = router;