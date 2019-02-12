var Products=[
    {id:101,name:"p1"},
    {id:102,name:"p2"}
];
module.exports={
    getData:function(){
            return Products;
    },
    addData:function(prd){
        Products.push(prd);
        return Products;

    }
};