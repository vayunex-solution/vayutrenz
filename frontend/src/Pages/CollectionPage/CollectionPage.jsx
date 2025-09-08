import Sidebar from '../../Components/Sidebar/Sidebar.jsx'
import ProductCollection from '../../Components/ProductCollection/ProductCollection'
import "./CollectionPage.css"

const CollectionPage = () => {
    return (
        <div className="collection-page-main-container">
            <Sidebar/>
            <ProductCollection/>

        </div>

    )
}

export default CollectionPage;