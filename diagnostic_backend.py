#!/usr/bin/env python3
"""
Test de connectivité basique pour diagnostiquer le problème de connexion
"""
import socket
import urllib.request
import json
import time

def test_port(host, port):
    """Test si un port est ouvert"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

def test_http(url):
    """Test de requête HTTP"""
    try:
        response = urllib.request.urlopen(url, timeout=5)
        data = response.read().decode()
        return True, response.status, data
    except Exception as e:
        return False, str(e), None

def main():
    print("🔍 DIAGNOSTIC DE CONNECTIVITÉ BACKEND")
    print("=" * 50)
    
    # Test 1: Port 8000 accessible
    print("\n1️⃣ Test du port 8000...")
    hosts_to_test = ['127.0.0.1', 'localhost']
    
    for host in hosts_to_test:
        port_open = test_port(host, 8000)
        status = "✅ OUVERT" if port_open else "❌ FERMÉ"
        print(f"   {host}:8000 - {status}")
    
    # Test 2: Requête HTTP
    print("\n2️⃣ Test de requête HTTP...")
    urls_to_test = [
        'http://127.0.0.1:8000/health',
        'http://localhost:8000/health'
    ]
    
    for url in urls_to_test:
        success, status, data = test_http(url)
        if success:
            print(f"   ✅ {url} - Status: {status}")
            try:
                json_data = json.loads(data)
                print(f"      Response: {json_data}")
            except:
                print(f"      Response: {data[:100]}...")
        else:
            print(f"   ❌ {url} - Erreur: {status}")
    
    # Test 3: Processus sur le port
    print("\n3️⃣ Diagnostic du processus...")
    try:
        import subprocess
        result = subprocess.run(['netstat', '-an'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        port_8000_lines = [line for line in lines if ':8000' in line]
        
        if port_8000_lines:
            print("   ✅ Processus trouvé sur le port 8000:")
            for line in port_8000_lines:
                print(f"      {line.strip()}")
        else:
            print("   ❌ Aucun processus sur le port 8000")
    except:
        print("   ⚠️ Impossible de vérifier les processus")
    
    print("\n" + "=" * 50)
    print("💡 RECOMMANDATIONS:")
    print("   1. Si le port est fermé : Démarrez le backend")
    print("   2. Si HTTP échoue : Vérifiez la configuration CORS")
    print("   3. Si tout fonctionne : Le problème est côté frontend")

if __name__ == "__main__":
    main()
