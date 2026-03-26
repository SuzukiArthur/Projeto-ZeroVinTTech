import { Link } from 'react-router-dom';
import { Donation } from '../types';
import { Clock, User, Tag } from 'lucide-react';

interface DonationCardProps {
  donation: Donation;
  key?: string | number;
}

export default function DonationCard({ donation }: DonationCardProps) {
  const conditionColor = {
    'Novo': 'bg-green-500',
    'Usado - Bom': 'bg-blue-500',
    'Para Conserto': 'bg-orange-500'
  }[donation.condition];

  return (
    <Link to={`/donation/${donation.id}`} className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#FF8C00]/50 transition-all duration-300 flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={donation.photos[0] || `https://picsum.photos/seed/${donation.id}/400/300`} 
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${conditionColor}`}>
            {donation.condition}
          </div>
          {donation.category && (
            <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#FF8C00] border border-[#FF8C00]/30 w-fit">
              {donation.category}
            </div>
          )}
        </div>
        {donation.status === 'requested' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-[#FF8C00] text-black px-4 py-1 rounded-full font-bold text-sm">RESERVADO</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-white group-hover:text-[#FF8C00] transition-colors line-clamp-1">
          {donation.title}
        </h3>
        <p className="text-zinc-400 text-sm mt-1 line-clamp-2 flex-grow">
          {donation.description}
        </p>
        
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span className="line-clamp-1">{donation.donorName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{
              donation.createdAt?.toDate ? 
              new Date(donation.createdAt.toDate()).toLocaleDateString() : 
              new Date(donation.createdAt).toLocaleDateString()
            }</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
