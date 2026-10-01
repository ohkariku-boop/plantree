import { Link } from 'react-router-dom'
import { Leaf, Plus } from 'lucide-react'
import { getPlants } from '../lib/storage'
import { format } from 'date-fns'

export default function PlantsPage() {
  const plants = getPlants()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sage-800">My Plants</h1>
          <p className="text-sage-600 text-sm mt-1">
            {plants.length} plant{plants.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <Link
          to="/identify"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-500 text-white text-sm font-medium hover:bg-sage-600 transition"
        >
          <Plus className="w-4 h-4" />
          Add
        </Link>
      </div>

      {plants.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-sage-200">
          <Leaf className="w-12 h-12 mx-auto text-sage-300 mb-3" />
          <p className="text-sage-600 font-medium">No plants yet</p>
          <p className="text-sm text-sage-500 mt-1 mb-4">Identify a plant to start your collection</p>
          <Link
            to="/identify"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-500 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Identify first plant
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {plants.map(plant => (
            <Link
              key={plant.id}
              to={`/plants/${plant.id}`}
              className="flex gap-4 p-3 rounded-2xl bg-white border border-sage-200 shadow-sm hover:shadow-md hover:border-sage-300 transition"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-sage-100 flex-shrink-0">
                {plant.imageUrl ? (
                  <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sage-400">
                    <Leaf className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sage-800 truncate">{plant.name}</h3>
                {plant.scientificName && (
                  <p className="text-xs italic text-sage-500 truncate">{plant.scientificName}</p>
                )}
                <p className="text-xs text-sage-500 mt-1">
                  Added {format(new Date(plant.addedAt), 'MMM d, yyyy')}
                </p>
                {plant.healthStatus && plant.healthStatus !== 'healthy' && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Needs attention
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
