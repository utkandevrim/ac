import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  Search, 
  Users, 
  User, 
  Phone, 
  MapPin,
  Briefcase,
  Award,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MembersList = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [boardMemberFilter, setBoardMemberFilter] = useState('all');
  const [selectedTeamLeader, setSelectedTeamLeader] = useState(null);
  const [leaderPhotos, setLeaderPhotos] = useState({});
  const navigate = useNavigate();

  // Team leaders data
  const teamLeaders = [
    { name: 'Tuğba Çakı', team: 'Tuğba Çakı', teamName: 'Diyojen', color: 'from-red-500 to-orange-500' },
    { name: 'Duygu Asker Aksoy', team: 'Duygu Asker Aksoy', teamName: 'Hypatia', color: 'from-purple-500 to-pink-500' },
    { name: 'Seda Ateş', team: 'Seda Ateş', teamName: 'Hermes', color: 'from-blue-500 to-cyan-500' },
    { name: 'Utkan Devrim Zeyrek', team: 'Utkan Devrim Zeyrek', teamName: 'Artemis', color: 'from-green-500 to-teal-500' }
  ];

  const boardMembers = [
    'Tuğba Çakı',
    'Duygu Asker Aksoy', 
    'Seda Ateş',
    'Utkan Devrim Zeyrek'
  ];

  useEffect(() => {
    fetchMembers();
    fetchLeaderPhotos();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchTerm, boardMemberFilter]);

  const fetchLeaderPhotos = async () => {
    try {
      const response = await axios.get(`${API}/leadership`);
      const photos = {};
      response.data.forEach(leader => {
        // Match by name
        if (leader.photo) {
          photos[leader.name] = leader.photo;
        }
      });
      setLeaderPhotos(photos);
    } catch (error) {
      console.error('Error fetching leader photos:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter out admin and test users for non-admin users
      let filteredUsers = response.data;
      if (!user.is_admin) {
        filteredUsers = response.data.filter(member => 
          !member.is_admin && 
          !member.username.includes('test.') && 
          member.name !== 'Test'
        );
      }
      
      setMembers(filteredUsers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    // Text search - case insensitive and includes all profile fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(member => {
        const searchableFields = [
          member.name,
          member.surname,
          member.email,
          member.phone,
          member.workplace,
          member.job_title,
          member.hobbies,
          member.skills,
          member.address,
          member.board_member,
          ...(member.projects || [])
        ];
        
        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // Board member filter
    if (boardMemberFilter !== 'all') {
      if (boardMemberFilter === 'admin') {
        filtered = filtered.filter(member => member.is_admin);
      } else {
        filtered = filtered.filter(member => member.board_member === boardMemberFilter);
      }
    }

    setFilteredMembers(filtered);
  };

  const handleMemberClick = (memberId) => {
    navigate(`/profile/${memberId}`);
  };

  const getTeamDisplayName = (teamName) => {
    const teamMappings = {
      'Tuğba Çakı': 'Diyojen - Tuğba Çakı',
      'Duygu Asker Aksoy': 'Hypatia - Duygu Asker Aksoy',
      'Utkan Devrim Zeyrek': 'Artemis - Utkan Devrim Zeyrek',
      'Seda Ateş': 'Hermes - Seda Ateş'
    };
    return teamMappings[teamName] || teamName;
  };

  const handleTeamClick = (teamName) => {
    setBoardMemberFilter(teamName);
    setSelectedTeamLeader(teamName);
    setSearchTerm('');
    // Show toast with team info
    const teamMembers = members.filter(m => m.board_member === teamName);
    toast.info(`${getTeamDisplayName(teamName)} takımı: ${teamMembers.length} üye`, { duration: 3000 });
  };

  const handleClearFilter = () => {
    setBoardMemberFilter('all');
    setSelectedTeamLeader(null);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-xl font-semibold theme-text">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold theme-text mb-2" data-testid="members-title">
            Üyelerimiz
          </h1>
          <p className="text-lg theme-text-secondary">
            Actor Club ailesinin {members.length} üyesi
          </p>
        </div>

        {/* Team Leaders Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold theme-text mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-amber-500" />
            Takım Liderleri
            <span className="text-sm font-normal theme-text-secondary ml-2">(Takımı görmek için tıklayın)</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teamLeaders.map((leader) => {
              const teamMemberCount = members.filter(m => m.board_member === leader.team).length;
              const isSelected = selectedTeamLeader === leader.team;
              const leaderPhoto = leaderPhotos[leader.name];
              
              return (
                <Card 
                  key={leader.name}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  }`}
                  onClick={() => handleTeamClick(leader.team)}
                  data-testid={`team-leader-${leader.team}`}
                >
                  <div className="text-center">
                    {leaderPhoto ? (
                      <img 
                        src={`${BACKEND_URL}${leaderPhoto}`}
                        alt={leader.name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-white shadow-lg"
                      />
                    ) : (
                      <div className={`w-16 h-16 bg-gradient-to-br ${leader.color} rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                        {leader.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <h3 className="font-bold text-white text-sm mb-1">{leader.name}</h3>
                    <p className="text-xs text-gray-300 mb-2">{leader.teamName} Takımı</p>
                    <Badge className="bg-blue-500 text-white font-semibold">
                      {teamMemberCount} üye
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Clear Filter Button */}
          {selectedTeamLeader && (
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={handleClearFilter}
                className="text-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtreyi Temizle - Tüm Üyeleri Göster
              </Button>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 theme-text-muted" />
            <Input
              type="text"
              placeholder="Üye ara... (ad, soyad, e-posta, telefon, işyeri, pozisyon, hobiler, yetenekler, adres, projeler)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 theme-input"
              data-testid="member-search-input"
            />
          </div>
          
          <Select value={boardMemberFilter} onValueChange={setBoardMemberFilter}>
            <SelectTrigger className="w-full sm:w-48 theme-input" data-testid="board-filter">
              <Filter className="h-4 w-4 mr-2 theme-text-muted" />
              <SelectValue placeholder="Grup Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Üyeler</SelectItem>
              <SelectItem value="admin">Yöneticiler</SelectItem>
              {boardMembers.map((member) => (
                <SelectItem key={member} value={member}>
                  {member} Grubu
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="theme-card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-secondary">Toplam Üye</p>
                <p className="text-2xl font-bold theme-text" data-testid="total-members-count">{members.length}</p>
              </div>
            </div>
          </Card>

          <Card className="theme-card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-secondary">Tuğba Çakı Grubu</p>
                <p className="text-2xl font-bold theme-text" data-testid="tugba-group-count">
                  {members.filter(m => m.board_member === 'Tuğba Çakı').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="theme-card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-secondary">Duygu Aksoy Grubu</p>
                <p className="text-2xl font-bold theme-text" data-testid="duygu-group-count">
                  {members.filter(m => m.board_member === 'Duygu Asker Aksoy').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="theme-card p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium theme-text-secondary">Filtrelenen</p>
                <p className="text-2xl font-bold theme-text" data-testid="filtered-count">{filteredMembers.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card 
              key={member.id} 
              className="theme-card hover-lift cursor-pointer p-6"
              onClick={() => handleMemberClick(member.id)}
              data-testid={`member-card-${member.id}`}
            >
              {/* Profile Header */}
              <div className="flex items-center mb-4">
                {member.profile_photo ? (
                  <img 
                    src={`${BACKEND_URL}${member.profile_photo}`} 
                    alt={`${member.name} ${member.surname}`}
                    className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-red-200"
                    data-testid={`member-photo-${member.id}`}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4">
                    {member.name?.[0]}{member.surname?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold theme-text mb-1" data-testid={`member-name-${member.id}`}>
                    {member.name} {member.surname}
                  </h3>
                  <p className="text-sm theme-text-secondary" data-testid={`member-email-${member.id}`}>{member.email}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={member.is_admin ? "default" : "secondary"} className={member.is_admin ? "bg-red-100 text-red-800" : ""}>
                  {member.is_admin ? 'Yönetici' : 'Üye'}
                </Badge>
                {member.board_member && (
                  <Badge 
                    className="team-badge cursor-pointer" 
                    data-testid={`member-board-${member.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTeamClick(member.board_member);
                    }}
                  >
                    {getTeamDisplayName(member.board_member)}
                  </Badge>
                )}
                <Badge variant="outline" className={member.is_approved ? "text-green-600 border-green-300" : "text-orange-600 border-orange-300"}>
                  {member.is_approved ? 'Onaylı' : 'Beklemede'}
                </Badge>
              </div>

              {/* Quick Info */}
              <div className="space-y-2 text-sm theme-text-secondary">
                {member.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span data-testid={`member-phone-${member.id}`}>{member.phone}</span>
                  </div>
                )}
                
                {member.workplace && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span className="truncate" data-testid={`member-workplace-${member.id}`}>{member.workplace}</span>
                  </div>
                )}

                {member.job_title && (
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    <span className="truncate" data-testid={`member-jobtitle-${member.id}`}>{member.job_title}</span>
                  </div>
                )}

                {member.projects && member.projects.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-gray-700 mb-1">Projeler:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.projects.slice(0, 2).map((project, index) => (
                        <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded" data-testid={`member-project-${member.id}-${index}`}>
                          {project}
                        </span>
                      ))}
                      {member.projects.length > 2 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{member.projects.length - 2} daha
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Profile Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMemberClick(member.id);
                  }}
                  data-testid={`view-profile-${member.id}`}
                >
                  Profili Görüntüle
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Üye bulunamadı</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `"${searchTerm}" araması için sonuç bulunamadı`
                : 'Seçilen filtrelere uygun üye bulunmuyor'
              }
            </p>
          </div>
        )}

        {/* Load More - Future enhancement */}
        {filteredMembers.length > 0 && filteredMembers.length === members.length && (
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Tüm üyeler görüntülendi ({filteredMembers.length} üye)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersList;