package com.example.base.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "item_synonyms")
public class ItemSynonym implements Serializable {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "synonym_id")
    private Long synonymId;
    
    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private Recipe item;
    
    @Column(name = "synonym", nullable = false)
    private String synonym;
    
    @Column(name = "similarity_score", nullable = false)
    private Float similarityScore;
    
    // Constructors
    public ItemSynonym() {
    }
    
    public ItemSynonym(Recipe item, String synonym, Float similarityScore) {
        this.item = item;
        this.synonym = synonym;
        this.similarityScore = similarityScore;
    }
    
    // Getters and Setters
    public Long getSynonymId() {
        return synonymId;
    }
    
    public void setSynonymId(Long synonymId) {
        this.synonymId = synonymId;
    }
    
    public Recipe getItem() {
        return item;
    }
    
    public void setItem(Recipe item) {
        this.item = item;
    }
    
    public String getSynonym() {
        return synonym;
    }
    
    public void setSynonym(String synonym) {
        this.synonym = synonym;
    }
    
    public Float getSimilarityScore() {
        return similarityScore;
    }
    
    public void setSimilarityScore(Float similarityScore) {
        this.similarityScore = similarityScore;
    }
    
    @Override
    public String toString() {
        return "ItemSynonym{" +
                "synonymId=" + synonymId +
                ", item=" + (item != null ? item.getRecipeId() : null) +
                ", synonym='" + synonym + '\'' +
                ", similarityScore=" + similarityScore +
                '}';
    }
} 