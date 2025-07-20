'use client'
import React, { useState } from 'react';
import { Star, Heart, MessageCircle, Share2, Settings, User, Bell, Search, ChevronRight, Calendar, MapPin } from 'lucide-react';

const ThemeTestPage = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [notifications, setNotifications] = useState(3);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Theme Test</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            >
              Toggle Theme
            </button>
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {['home', 'explore', 'trending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">User {i}</h3>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-card-foreground mb-4">
                  This is a sample post content to test how the theme colors work with different components. 
                  The text should adapt to light and dark modes seamlessly.
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsLiked(!isLiked)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all ${
                        isLiked 
                          ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">42</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">12</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Alert/Banner */}
          <div className="bg-accent border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-accent-foreground mb-1">New Feature Available!</h4>
                <p className="text-sm text-muted-foreground">
                  Check out our latest update with improved theme customization options.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-card-foreground">John Doe</h3>
              <p className="text-sm text-muted-foreground">Software Developer</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posts</span>
                <span className="text-card-foreground font-medium">124</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Followers</span>
                <span className="text-card-foreground font-medium">1.2k</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Following</span>
                <span className="text-card-foreground font-medium">456</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Trending Topics */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-card-foreground mb-4">Trending</h3>
            <div className="space-y-3">
              {[
                { topic: 'React', posts: '234k' },
                { topic: 'TypeScript', posts: '156k' },
                { topic: 'Tailwind CSS', posts: '89k' },
                { topic: 'Next.js', posts: '167k' }
              ].map(({ topic, posts }) => (
                <div key={topic} className="flex items-center justify-between hover:bg-accent hover:text-accent-foreground p-2 -m-2 rounded-lg cursor-pointer transition-all">
                  <div>
                    <p className="font-medium">#{topic}</p>
                    <p className="text-sm text-muted-foreground">{posts} posts</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-card-foreground mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {[1, 2].map((event) => (
                <div key={event} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <h4 className="font-medium text-card-foreground mb-2">Tech Conference 2024</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Dec 15, 2024</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Connect</h4>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-primary-foreground text-sm font-bold">T</span>
                </div>
                <div className="w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-primary-foreground text-sm font-bold">G</span>
                </div>
                <div className="w-8 h-8 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <span className="text-primary-foreground text-sm font-bold">L</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 Theme Test App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThemeTestPage;