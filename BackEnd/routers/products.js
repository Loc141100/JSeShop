const express = require('express');
const { default: mongoose } = require('mongoose');
const {Category } = require('../model/category');
const router = express.Router();
const {Product}= require('../model/product');
const multer = require('multer');

const FILE_TYPE_MAP ={
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        const rightFileTypye = FILE_TYPE_MAP[file.mimetype]; //kiem tra file type trong FILE_TYPE_MAP neu dung tra ve true
        let wrongTypeError = new Error('Please input a png,jpeg or jpg file');

        if (rightFileTypye)
        {
            wrongTypeError = null;
        }

      cb(wrongTypeError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(' ', '-');
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
  })
  
const uploadOption = multer({ storage: storage })

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


router.put(`/:id`,uploadOption.single('image'), async(req,res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
            return res.status(400).send('cant find the id of product');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('cant find the id of category');

    const checkProduct = await Product.findById(req.params.id);
    if (!checkProduct) return res.status('400').send('The product is not exist');

    const file = req.file;
    let imagePath;

    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    }else
    {
        imagePath = product.image;
    }

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


//add more images in the product
router.put(`/gallery-images/:id`,uploadOption.array('images',10), async (req,res) =>{

    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('cant find the id of product');
    }


    const fileimages = req.files;
    let imagesPaths =[];
    const category = await Category.findById(req.body.category);
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (!category) {
        return res.status(400).send('cant find the id of category');
    }


    if (fileimages){
        fileimages.map((file) =>{
            imagesPaths.push(`${basePath}${file.fileName}`);
        })
    }
 
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        {new : true}
    )
    if (!product)
    return res.status(500).send('Cant find the id of Product');
    res.send(product);
});

//post 1 product
router.post(`/`,uploadOption.single('image'), async (req,res ) =>
    {
        // if(!mongoose.isValidObjectId(req.params.id))
        // return res.status(400).send('The Product not exist');
        const fileImage = req.file; 
        if(!fileImage) return res.status(400).send('You forgot to put main image');
        const category = await Category.findById(req.body.category);
        if(!category) return res.status(400).send('The Category not exist');
        const fileName = req.file.fieldname;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
       let product = new Product(
           {
               name : req.body.name,
               description: req.body.description,
               richDescription: req.body.richDescription,
               image: `${basePath}${fileName}`,
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