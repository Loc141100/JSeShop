const express = require('express');
const { default: mongoose } = require('mongoose');
const {Category } = require('../model/category');
const router = express.Router();
const {Product}= require('../model/product');
router.get(`/all`, async (req,res ) =>
    {
       const productList = await Product.find().populate('category');
       if (!productList)
        {
            res.status(500).json({success: false});
        }
        res.send(productList);  
    }
)

router.get(`/`, async (req, res) =>{
    // localhost:3000/api/v1/products?categories=2342342,234234
    let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})



router.get(`/:id`, async (req,res ) =>
    {
       const product = await Product.findById(req.params.id).populate('category');
       if (!product)
        {
            res.status(500).json({success: false});
        }
        res.send(product);  
    }
)


router.put(`/:id`, async(req,res)=>{
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name : req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        {new : true}
    )
    if (!product)
    return res.status(500).send('Cant find the id of Product');
    res.send(product);
})

router.post(`/`,async (req,res ) =>
    {
        // if(!mongoose.isValidObjectId(req.params.id))
        // return res.status(400).send('The Product not exist');
        const category = await Category.findById(req.body.category);
        if(!category) return res.status(400).send('The Category not exist');
        
       const product = new Product(
           {
               name : req.body.name,
               description: req.body.description,
               richDescription: req.body.richDescription,
               image: req.body.image,
               brand: req.body.brand,
               price: req.body.price,
               category: req.body.category,
               countInStock: req.body.countInStock,
               rating: req.body.rating,
               numReviews: req.body.numReviews,
               isFeatured: req.body.isFeatured,
           })
           const products = await product.save();
           if(!products)
           return res.status(500).send('Cant create product');
           res.send(products);
})


router.delete(`/:id`, (req,res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product)
        {
            return res.status(200).json({success: true, message: 'the product have deleted'});
        }
        else
        {
            return res.status(404).json({success: false, message: "product not found"});
        }
    }).catch(err =>{
        return res.status(400).json({success: false, error: err});
    })
})

router.get(`/get/count`, async (req,res ) =>
    {
       const productCount = await Product.countDocuments();
       if (!productCount)
        {
            res.status(500).json({success: false});
        }
        res.send({
            count: productCount
        });  
    })
router.get(`/get/featured/:count`, async (req,res ) =>
    {
        const count = req.params.count? req.params.count:0;
       const product = await Product.find({isFeatured:true}).limit(+count);
       if (!product)
        {
            res.status(500).json({success: false});
        }
        res.send(product);  
    })
module.exports = router;