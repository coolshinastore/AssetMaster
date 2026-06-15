package com.assetmaster.api.service;

import com.assetmaster.api.dto.BlogPostDto;
import com.assetmaster.api.dto.CreateBlogPostRequestDto;
import com.assetmaster.api.entity.BlogPost;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BlogPostService {

    private final BlogPostRepository repo;

    public Page<BlogPostDto> getPublishedPosts(int page, int size) {
        return repo.findByPublishedTrueOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(BlogPostDto::from);
    }

    public BlogPostDto getPublishedBySlug(String slug) {
        return repo.findBySlugAndPublishedTrue(slug)
                .map(BlogPostDto::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Стаття не знайдена"));
    }

    public Page<BlogPostDto> getAllPosts(int page, int size) {
        return repo.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(BlogPostDto::from);
    }

    @Transactional
    public BlogPostDto createPost(CreateBlogPostRequestDto req, User author) {
        if (repo.existsBySlug(req.slug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug вже існує");
        }
        BlogPost post = BlogPost.builder()
                .slug(req.slug()).tag(req.tag()).title(req.title())
                .excerpt(req.excerpt()).content(req.content())
                .published(req.published()).readTime(req.readTime())
                .author(author).build();
        return BlogPostDto.from(repo.save(post));
    }

    @Transactional
    public BlogPostDto updatePost(Long id, CreateBlogPostRequestDto req) {
        BlogPost post = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (repo.existsBySlugAndIdNot(req.slug(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug вже існує");
        }
        post.setSlug(req.slug());
        post.setTag(req.tag());
        post.setTitle(req.title());
        post.setExcerpt(req.excerpt());
        post.setContent(req.content());
        post.setPublished(req.published());
        post.setReadTime(req.readTime());
        return BlogPostDto.from(repo.save(post));
    }

    @Transactional
    public void deletePost(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        repo.deleteById(id);
    }
}
