T-SIP Web frontend
==================

Web based interface for managing users and customers and configuring call flows.

License
-------

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.


Prerequisites
-------------

curent NodeJS
current Npm
angular-cli (ng)

Backend is assumed to be reachable on /rest
Oauth client id and secret assumed to be in environments/*


Development
-----------

You should be able to install the project with
 
    npm install
    
run with ng serve


Production
----------

ng build --prod